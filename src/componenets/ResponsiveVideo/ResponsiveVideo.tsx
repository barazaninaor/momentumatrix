import React from "react";
import "./ResponsiveVideo.css";

interface ResponsiveVideoProps {
  videoUrl: string;
  title?: string;
}

export const ResponsiveVideo: React.FC<ResponsiveVideoProps> = ({ videoUrl, title = "Video Player" }) => {
  return (
    <div className="video-container">
      <iframe
        src={videoUrl}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};