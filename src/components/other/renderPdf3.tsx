import { Suspense, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   'pdfjs-dist/build/pdf.worker.min.mjs',
//   import.meta.url,
// ).toString();
// pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`; // original beam
// pdfjs.GlobalWorkerOptions.workerSrc="https://unpkg.com/pdfjs-dist@4.4.168/legacy/build/pdf.worker.min.mjs" // kom test
// pdfjs.GlobalWorkerOptions.workerSrc = new URL('https://unpkg.com/pdfjs-dist/legacy/build/pdf.worker.min.mjs', import.meta.url).toString()
// pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist/legacy/build/pdf.worker.min.mjs'


// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   "pdfjs-dist/build/pdf.worker.min.js",
//   import.meta.url
// ).toString();

interface PdfViewerProps {
  pdfUrl: string;
}

const PdfViewer3: React.FC<PdfViewerProps> = ({ pdfUrl }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const containerRef:any = useRef(null); // Create a ref for the document container

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        const scrollHeight = containerRef.current.scrollHeight;
        const clientHeight = containerRef.current.clientHeight;

        // Check if scrolled to bottom of the container
        if (scrollTop + clientHeight >= scrollHeight - 10) {
          setScrolledToBottom(true);
        } else {
          setScrolledToBottom(false);
        }
      }
    };

    const container = containerRef.current;
    container?.addEventListener("scroll", handleScroll);

    return () => {
      container?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="w-full flex justify-center items-center">
      <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
        {numPages > 0 && Array.from({ length: numPages }, (_, index) => (
          <Page key={`page_${index + 1}`} pageNumber={index + 1} />
        ))}
      </Document>
    </div>

    // <div className="no-scrollbar">
    //   <div ref={containerRef} >
    //     <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
    //       {numPages > 0 &&
    //         Array.from({ length: numPages }, (_, index) => (
    //           <Page key={`page_${index + 1}`} pageNumber={index + 1} />
    //         ))}
    //     </Document>
    //   </div>
    //   {scrolledToBottom && <div>You've scrolled to the bottom!</div>}
    // </div>
  );
};

export default PdfViewer3;


// import { useState } from "react";
// // import { Document, Page, pdfjs } from "react-pdf";
// import { Document, Page, pdfjs } from "react-pdf";
// import "react-pdf/dist/Page/AnnotationLayer.css";
// import "react-pdf/dist/Page/TextLayer.css";

// // pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
// pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

// interface PdfViewerProps {
//   pdfUrl: string;
// }

// const PdfViewer3: React.FC<PdfViewerProps> = ({ pdfUrl }) => {
//   const [numPages, setNumPages] = useState<number>(0);

//   function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
//     setNumPages(numPages);
//   }

//   return (
//     <div className="w-full flex justify-center items-center">
//       {pdfUrl && (
//         <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
//           {numPages > 0 &&
//             Array.from({ length: numPages }, (_, index) => (
//               <Page key={`page_${index + 1}`} pageNumber={index + 1} />
//             ))}
//         </Document>
//       )}
//     </div>
//   );
// };

// export default PdfViewer3;