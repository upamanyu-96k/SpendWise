import { useTheme } from '../theme.jsx';
import Icon from './Icons.jsx';

const OPTIONS = [['light', 'sun', 'Light'], ['dark', 'moon', 'Dark'], ['system', 'monitor', 'System']];

export default function ThemeToggle({ compact = false }) {
  const { preference, setPreference } = useTheme();
  return (
    <div className="inline-flex rounded-xl border border-line bg-raised/60 p-1" role="group" aria-label="Theme">
      {OPTIONS.map(([value, icon, label]) => (
        <button key={value} type="button" onClick={() => setPreference(value)} aria-pressed={preference === value} aria-label={`${label} theme`} title={label}
          className={`grid place-items-center rounded-lg transition ${compact ? 'size-8' : 'size-9'} ${preference === value ? 'bg-surface text-brand shadow-card' : 'text-muted hover:text-main'}`}>
          <Icon name={icon} className="size-4" />
        </button>
      ))}
    </div>
  );
}
