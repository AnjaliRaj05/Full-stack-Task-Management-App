/* eslint-disable no-console */
/**
 * One-time data migration: for every existing user, create a personal workspace
 * (if they don't have one) and backfill workspace on their tasks, comments, activity.
 *
 * Idempotent — running it twice does nothing the second time.
 *
 * Usage:  node scripts/migrate-add-workspaces.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const config = require('../config');
const User = require('../models/User');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const workspaceService = require('../services/workspaceService');

async function main() {
  await mongoose.connect(config.mongoUrl);
  console.log('Connected to Mongo');

  const users = await User.find({}).select('_id fullname email defaultWorkspace');
  console.log(`Found ${users.length} users`);

  let createdWorkspaces = 0;
  let migratedTasks = 0;
  let migratedComments = 0;
  let migratedActivity = 0;

  for (const user of users) {
    const workspace = await workspaceService.ensurePersonalWorkspace(user);
    if (!user.defaultWorkspace) createdWorkspaces += 1;

    const taskResult = await Task.updateMany(
      { createdBy: user._id, $or: [{ workspace: { $exists: false } }, { workspace: null }] },
      { $set: { workspace: workspace._id } }
    );
    migratedTasks += taskResult.modifiedCount || 0;

    const taskIds = await Task.find({ workspace: workspace._id }).distinct('_id');
    if (taskIds.length > 0) {
      const commentResult = await Comment.updateMany(
        { taskId: { $in: taskIds }, $or: [{ workspace: { $exists: false } }, { workspace: null }] },
        { $set: { workspace: workspace._id } }
      );
      migratedComments += commentResult.modifiedCount || 0;

      const activityResult = await Activity.updateMany(
        { taskId: { $in: taskIds }, $or: [{ workspace: { $exists: false } }, { workspace: null }] },
        { $set: { workspace: workspace._id } }
      );
      migratedActivity += activityResult.modifiedCount || 0;
    }
  }

  console.log('Migration complete:');
  console.log(`  Created default workspaces: ${createdWorkspaces}`);
  console.log(`  Migrated tasks:             ${migratedTasks}`);
  console.log(`  Migrated comments:          ${migratedComments}`);
  console.log(`  Migrated activity entries:  ${migratedActivity}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
