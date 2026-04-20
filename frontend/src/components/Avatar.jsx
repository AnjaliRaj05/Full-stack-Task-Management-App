import '../styles/Avatar.css';

const GRADIENTS = [
  'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
  'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
  'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
  'linear-gradient(135deg, #14b8a6 0%, #3b82f6 100%)',
  'linear-gradient(135deg, #f472b6 0%, #fb7185 100%)',
  'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
];

const hashCode = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
};

const initialsOf = (name) => {
  if (!name) return '?';
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 72,
};

const Avatar = ({ name, size = 'md', className = '', title }) => {
  const px = sizeMap[size] || sizeMap.md;
  const gradient = GRADIENTS[hashCode(name || '') % GRADIENTS.length];
  const initials = initialsOf(name);

  return (
    <span
      className={`avatar avatar-${size} ${className}`}
      style={{
        width: px,
        height: px,
        fontSize: Math.max(10, Math.round(px * 0.38)),
        background: gradient,
      }}
      title={title || name}
      aria-label={title || name}
    >
      {initials}
    </span>
  );
};

export default Avatar;
