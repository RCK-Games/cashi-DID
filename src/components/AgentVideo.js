import { useContext, useEffect, useRef, useState } from "react";
import { ElementContextOpenAi } from "../context/OpenAiContext";
import emma from "../components/Streaming/emma_idle.mp4";
import video1 from "../components/Streaming/Props/video (1).mp4";
import video2 from "../components/Streaming/Props/video (2).mp4";
import video3 from "../components/Streaming/Props/video (3).mp4";
import video4 from "../components/Streaming/Props/video (4).mp4";
import video5 from "../components/Streaming/Props/video (5).mp4";
const AgentVideo = () => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const loadedVideo = useRef(false);

  const { agentVideo, finishLoading } = useContext(ElementContextOpenAi);

  useEffect(() => {
    if (finishLoading && agentVideo != null) {
      ///Hacer algo para pedir los videos con loadedVideo
      loadedVideo.current = video1;
      console.log(agentVideo)
      if(agentVideo === "¿que es cashi?" ) {
        loadedVideo.current = video2;
      }
      if(agentVideo === "¿como funciona cashi?" ) {
        loadedVideo.current = video2;
      }
      if(agentVideo === "¿tengo que pagar por usar cashi?") {
        loadedVideo.current = video3;
      }
      if(agentVideo === "¿como creo una cuenta de cashi?" ) {
        loadedVideo.current = video4;
      }
      if(agentVideo === "¿como accedo a mi cuenta?" ) {
        loadedVideo.current = video5;
      }
      if(agentVideo === "Bad Word" ) {
        loadedVideo.current = video5;
      }
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
          <source src={loadedVideo.current} type="video/mp4" />
        </video>
      </div>
    </div>
  );
};

export default AgentVideo;
