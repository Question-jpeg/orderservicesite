import React from "react";
import { useState, useEffect } from "react";

export default function ImageViewer({ images, navMinis, width, height, icon }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const plusSlides = (count) => {
    if (currentSlide + count < 0) setCurrentSlide(images.length - 1);
    else if (currentSlide + count === images.length) setCurrentSlide(0);
    else setCurrentSlide(currentSlide + count);
  };

  useEffect(() => {
    setCurrentSlide(0);
  }, [images]);

  return (
    <div style={{ width }} className="container">
      <div
        key={images[currentSlide]?.file}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {images[currentSlide]?.file ? (
          <img
            style={{ height, borderRadius: 20 }}
            src={images[currentSlide]?.file}
            className="image"
            alt=""
          />
        ) : (
          icon
        )}
      </div>
      {images[currentSlide]?.file && (
        <>
          <button className="prev" onClick={() => plusSlides(-1)}>
            &#10094;
          </button>
          <button className="next" onClick={() => plusSlides(1)}>
            &#10095;
          </button>
        </>
      )}
      {navMinis && (
        <div className="row">
          {images.map((fileObj, index) => (
            <div
              key={fileObj.file_thumbnail}
              className="column"
              style={{ width: `${100 / images.length}%` }}
            >
              <img
                className={`demo cursor image ${
                  currentSlide === index && "active"
                }`}
                src={fileObj.file_thumbnail}
                onClick={() => setCurrentSlide(index)}
                alt=""
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
