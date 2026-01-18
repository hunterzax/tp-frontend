import React, { useState, useEffect, useRef } from 'react';

const PdfViewer2: React.FC<{ pdfUrl: string }> = ({ pdfUrl }) => {
    const [atBottom, setAtBottom] = useState(false);
    const scrollContainerRef = useRef(null);

    const handleScroll = () => {

        const container = scrollContainerRef.current;
        if (container) {
            const { scrollHeight, scrollTop, clientHeight } = container;

            // Check if scrolled to the bottom
            if (scrollHeight - scrollTop === clientHeight) {
                setAtBottom(true);
            } else {
                setAtBottom(false);
            }
        }
    };

    return (
        <div className="w-full h-screen overflow-y-auto">
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="scrollable-div "
            >
                {/* Add enough content to make the div scrollable */}
                {/* {[...Array(50)].map((_, index) => (
                    <div key={index} className="content-item" style={{ padding: '10px' }}>
                        Item {index + 1}
                    </div>
                ))} */}
                <iframe
                    src={`${pdfUrl}#toolbar=0&zoom=130`}
                    className="w-full h-full bg-white"
                    frameBorder="0"
                    allowFullScreen
                    width="100%"
                    height="100%"
                    style={{ background: "#fff" }}
                // onScroll={() => handleScroll()}
                ></iframe>
            </div>

            {/* Button to show if scrolled to the bottom */}
            <div>
                {atBottom ? (
                    <button onClick={() => alert('You have scrolled to the bottom!')}>Accept</button>
                ) : (
                    <p>Scroll down to see the "Accept" button</p>
                )}
            </div>
        </div>
    );

};

export default PdfViewer2;
