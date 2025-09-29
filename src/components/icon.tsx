import { Activity } from 'lucide-react';
import { SVGProps } from 'react';

// `size` prop is required by Next.js
export default function Icon(props: { size: number }) {
  // We are not using the `size` prop to ensure the icon is always 32x32
  // and has a 4px padding.
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3490DC',
        borderRadius: '8px',
      }}
    >
      <Activity
        style={{
          width: '60%',
          height: '60%',
          color: 'white',
        }}
      />
    </div>
  );
}
