export const ASSETS = {
  hand: { 1: '/assets/1hand.jpg', 2: '/assets/2hand.jpg', 3: '/assets/3hand.jpg' },
  slot: { 1: '/assets/1Slot.jpg', 2: '/assets/2Slot.jpg', 3: '/assets/3Slot.jpg' },
  weight: '/assets/Weight.jpg',
  ds: '/assets/DS.jpg',
};
export const ICON_PX = 20;

export const ImgIcon = ({ src, title, size = ICON_PX, className = '' }) => (
  <span
    title={title}
    className={`inline-block shrink-0 align-[-2px] ${className}`}
    style={{ width: size, height: size, backgroundImage: `url(${src})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', imageRendering: 'auto' }}
    aria-hidden
  />
);

const cap = (n) => Math.max(0, Number(n || 0));

export const IconRowRepeat = ({ src, count, title, className = '', size = ICON_PX }) => {
  const n = cap(count); if (!n) return null;
  const max = 8, shown = Math.min(n, max), extra = n - shown;
  return (
    <span className={'inline-flex items-center gap-1 mr-3 ' + className} title={title}>
      {Array.from({ length: shown }).map((_, i) => (<ImgIcon key={i} src={src} size={size} />))}
      {extra > 0 && <span className="text-xs text-gray-300">+{extra}</span>}
    </span>
  );
};

export const IconRowComposite = ({ map, count, title, className = '', size = ICON_PX }) => {
  const n = cap(count); if (!n) return null;
  const capped = Math.min(n, 3);
  const src = map[capped] || map[3];
  const extra = n - capped;
  return (
    <span className={'inline-flex items-center gap-1 mr-3 ' + className} title={title}>
      <ImgIcon src={src} size={size} />
      {extra > 0 && <span className="text-xs text-gray-300">+{extra}</span>}
    </span>
  );
};
