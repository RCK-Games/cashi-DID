import { useContext, useEffect, useRef, useState } from "react";
import { ElementContextOpenAi } from "../context/OpenAiContext";
import emma from "../components/Streaming/emma_idle.mp4";
const AgentVideo = () => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const loadedVideo = useRef(false);

  const { agentVideo, finishLoading } = useContext(ElementContextOpenAi);

  useEffect(() => {
    if (finishLoading && agentVideo != null) {
      ///Hacer algo para pedir los videos con loadedVideo
      loadedVideo.current = emma;
      setIsVideoLoaded(true);
    }
  }, [agentVideo, finishLoading, loadedVideo]);

  if (isVideoLoaded === false) {
    return <></>;
  }

  return (
    <div className="AgentContainer">
      <div id="content">
        <video
          id="idle-video-element"
          autoPlay
          muted
          className="videoElementContainer"
          style={{ opacity: 1 }}
          onEnded={() => setIsVideoLoaded(false)}
        >
          <source src={emma} type="video/mp4" />
        </video>
      </div>
    </div>
  );
};

export default AgentVideo;
