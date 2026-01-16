import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploaderProps {
    label: string;
    onFileSelect: (file: File | null) => void;
    accept?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ label, onFileSelect, accept = ".csv" }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            setSelectedFile(file);
            onFileSelect(file);
        }
    }, [onFileSelect]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            onFileSelect(file);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        onFileSelect(null);
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

            <AnimatePresence mode="wait">
                {!selectedFile ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className={cn(
                            "relative border-2 border-dashed rounded-xl p-8 transition-colors duration-200 ease-in-out flex flex-col items-center justify-center cursor-pointer min-h-[160px]",
                            isDragging
                                ? "border-[var(--color-primary)] bg-pink-50"
                                : "border-gray-200 hover:border-[var(--color-primary)] hover:bg-gray-50"
                        )}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept={accept}
                            onChange={handleChange}
                        />
                        <div className="p-3 bg-purple-100 rounded-full mb-3 text-[var(--color-primary)]">
                            <UploadCloud className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium text-gray-600">
                            <span className="text-[var(--color-primary)]">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-400 mt-1">CSV files only</p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="relative border border-gray-200 rounded-xl p-4 bg-white shadow-soft-xl flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg text-green-600">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{selectedFile.name}</p>
                                <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                            </div>
                        </div>
                        <button
                            onClick={clearFile}
                            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
