const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        // 2.1 Màu thương hiệu
        primary: {
          DEFAULT: '#4B3621', // Nâu Cafe đậm
          light: '#6D543E',
        },
        accent: {
          DEFAULT: '#FF7D00', // Cam năng lượng
          hover: '#E67000',
        },
        // 2.2 Màu chức năng
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        // 2.3 Màu trung tính
        surface: '#FFFFFF',
        background: '#F9FAFB',
        border: '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // 3. Typography
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ], // Dùng cho tiền tệ
      },
      spacing: {
        touch: '48px', // 1.2 Vùng chạm tối thiểu
      },
    },
  },
  plugins: [],
};
