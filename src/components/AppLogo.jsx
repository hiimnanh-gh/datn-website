import logoSrc from '../assets/smartems_logo.png';

/**
 * AppLogo – shared system brand mark.
 *
 * Props:
 *  - size:  number  – icon side length in px (default 40)
 *  - showText: bool – whether to render the wordmark beside the icon
 *  - textLight: bool – render text in white (for dark backgrounds)
 */
const AppLogo = ({ size = 40, showText = true, textLight = false }) => (
  <div className="flex items-center gap-2.5 select-none">
    {/* Icon mark */}
    <div
      className="rounded-xl overflow-hidden flex-shrink-0 shadow-sm"
      style={{ width: size, height: size }}
    >
      <img
        src={logoSrc}
        alt="SmartEMS Logo"
        className="w-full h-full object-cover"
        draggable={false}
      />
    </div>

    {/* Wordmark */}
    {showText && (
      <div className="flex flex-col leading-none">
        <span
          className={`font-bold tracking-tight ${textLight ? 'text-white' : 'text-gray-900'}`}
          style={{ fontSize: size * 0.45, lineHeight: 1 }}
        >
          SmartEMS
        </span>
        <span
          className={`font-medium ${textLight ? 'text-secondary-fixed-dim' : 'text-on-surface-variant'}`}
          style={{ fontSize: 10, letterSpacing: '0.04em' }}
        >
          System Active
        </span>
      </div>
    )}
  </div>
);

export default AppLogo;
