import React, { useRef, useState, forwardRef } from 'react';

interface ImageFileInputProps {
  id: string;
  accept?: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImageFileInput = forwardRef<HTMLInputElement, ImageFileInputProps>(
  ({ id, accept = 'image/png', className = '', onChange }, ref) => {
    const [fileName, setFileName] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        setFileName(e.target.files[0].name);
      } else {
        setFileName('');
      }
      onChange?.(e);
    };

    return (
      <label
        htmlFor={id}
        className={`block w-full cursor-pointer border border-gray-200 rounded-lg bg-white px-3 py-2 text-sm transition focus-within:border-black ${className}`}
        style={{ minHeight: '2.5rem', display: 'flex', alignItems: 'center' }}
      >
        <input
          id={id}
          ref={ref || inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
        />
        <span className={fileName ? 'text-gray-900' : 'text-gray-500'}>
          {fileName || 'Ningún archivo seleccionado'}
        </span>
      </label>
    );
  }
);

export default ImageFileInput; 