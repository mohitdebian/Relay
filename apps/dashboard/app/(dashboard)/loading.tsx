import Typewriter from '@/app/components/Typewriter';

export default function Loading() {
  return (
    <div
      className="page-head"
      style={{
        borderBottom: 'none',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="page-title" style={{ opacity: 0.5 }}>
        <Typewriter text="LOADING..." />
      </div>
    </div>
  );
}
