import React, { useEffect, useRef, useState } from 'react';

interface PdfViewerProps {
  pdfUrl: string;
  onScrollToBottom?: () => void;
  handleScroll: any;
  scrollContainerRef: any;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl, onScrollToBottom, handleScroll, scrollContainerRef }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // const pdfViewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`;
  // const url_beam = `https://docs.google.com/gview?url=https://nu-test01.nueamek.app/tpa-sit/20241230041012_ED-PJO24003-FDS-004%20Functional%20Design%20for%20TPA%20System%20(PMIS%20Graphic%20Module)%20Rev.0.pdf&embedded=true#view=fitH`
  const url_beam = `https://docs.google.com/gview?url=https://nu-test01.nueamek.app/tpa-sit/20241230041012_ED-PJO24003-FDS-004%20Functional%20Design%20for%20TPA%20System%20(PMIS%20Graphic%20Module)%20Rev.0.pdf&embedded=true#view=fitH`;

  return (
    // <div className="w-full h-screen overflow-hidden">
    <div 
      style={{ transform: "scale(1)", transformOrigin: "top left", width: "100%", height: "100%" }} 
      // ref={scrollContainerRef}
      // onScroll={handleScroll}
    >

      <iframe
        color='#ffffff'
        // ref={iframeRef}
        ref={scrollContainerRef}
        onScroll={handleScroll}
        src={`${pdfUrl}#toolbar=0&zoom=120`} // PDF URL
        // src={url_beam}
        // className="w-full h-full bg-white"
        // allowFullScreen
        // style={{display: 'block', width: '100%', height: '100%'}}
        style={{ display: "block", width: "100%", height: "100%", border: "none" }}
        // width="1000"
        // height="100%"
        scrolling="auto"
        allowTransparency={false}
        frameBorder={0}
        // style={{ background: "#fff" }} 
      ></iframe>

      {/* <iframe
        color='#ffffff'
        ref={iframeRef}
        // src={`${pdfUrl}#toolbar=0&zoom=120`} // PDF URL
        style={{display: 'block', width: '100%', height: '100%'}}
        scrolling="auto"
        allowTransparency={false}
        frameBorder={0}
      ></iframe> */}
    </div>
  );
};

export default PdfViewer;