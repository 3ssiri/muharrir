'use client'

import { FileText, File } from '@/components/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface FileAttachmentIconProps {
  fileName: string
  fileType: string
  fileContent?: string
  className?: string
}

export function FileAttachmentIcon({ fileName, fileType, fileContent, className = '' }: FileAttachmentIconProps) {
  // Return the appropriate icon and color based on the file type
  const getFileIcon = () => {
    if (fileType === 'application/pdf') {
      return (
        <svg className={`w-5 h-5 ${className}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#FEE2E2"/>
          <path d="M14 2V8H20" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 13H8V17H10C10.5304 17 11.0391 16.7893 11.4142 16.4142C11.7893 16.0391 12 15.5304 12 15C12 14.4696 11.7893 13.9609 11.4142 13.5858C11.0391 13.2107 10.5304 13 10 13Z" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    } else if (fileType.includes('wordprocessing') || fileName.endsWith('.docx')) {
      return (
        <svg className={`w-5 h-5 ${className}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#DBEAFE"/>
          <path d="M14 2V8H20" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 13H8M16 17H8M10 9H8" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    } else if (fileType.startsWith('text/')) {
      return (
        <svg className={`w-5 h-5 ${className}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#D1FAE5"/>
          <path d="M14 2V8H20" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 13H8M16 17H8M10 9H8" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    } else {
      return <FileText className={`w-5 h-5 text-muted-foreground ${className}`} />
    }
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border border-border/50 max-w-xs cursor-pointer hover:bg-muted transition-colors">
            {getFileIcon()}
            <span className="text-sm font-medium truncate">{fileName}</span>
          </div>
        </TooltipTrigger>
        {fileContent && (
          <TooltipContent side="top" className="max-w-2xl max-h-96 overflow-auto p-4">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground border-b pb-2">
                معاينة الملف
              </div>
              <div className="text-sm whitespace-pre-wrap break-words">
                {fileContent.substring(0, 2000)}
                {fileContent.length > 2000 && '...'}
              </div>
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}
