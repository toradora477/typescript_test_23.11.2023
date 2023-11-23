import { useState, useEffect } from 'react';

const useResize = () => {
  const [size, setSize] = useState([0, 0]);

  useEffect(() => {
    const getSize = () => setSize([window.innerWidth, window.innerHeight]);
    getSize();
    window.addEventListener('resize', getSize);
    return () => window.removeEventListener('resize', getSize);
  }, []);

  return size; // * The size of the visible area of the site - [width, heigth]
};

export default useResize;
