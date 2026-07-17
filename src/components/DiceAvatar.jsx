import { Avatar as MuiAvatar } from '@mui/material';
import { useMemo } from 'react';

export default function DiceAvatar({ seed = 'User', size = 128, sx = {} }) {
  const avatarUrl = useMemo(() => {
    // We use the lorelei style as requested/suggested
    const url = new URL('https://api.dicebear.com/7.x/lorelei/svg');
    url.searchParams.set('seed', seed);
    url.searchParams.set('size', size.toString());
    url.searchParams.set('backgroundColor', 'b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc');
    return url.href;
  }, [seed, size]);

  return <MuiAvatar src={avatarUrl} alt={seed} sx={{ width: size, height: size, ...sx }} />;
}
