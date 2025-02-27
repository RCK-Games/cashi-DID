import { useEffect, useRef } from "react";
import "../../styles/Streaming.css";
import emma from "../Streaming/cashimiro_idle.mp4"
const StreamingApi = () => {

  const DID_API = {
    key: "Y2FzaGltaXJvLmFpQGdtYWlsLmNvbQ:rIjOUHjgu67IHsFNURkAH",
    url: "https://api.d-id.com",
    websocketUrl: "wss://ws-api.d-id.com",
    service: "talks",
  };
  let peerConnection;
  let pcDataChannel;
  let streamId;
  let sessionId;
  let sessionClientAnswer;

  let statsIntervalId;
  let lastBytesReceived;
  let videoIsPlaying = false;
  let streamVideoOpacity = 0;
  let ws = useRef(null)
  const stream_warmup = true;
  let isStreamReady = !stream_warmup;

  let idleVideoElement;
  let streamVideoElement;
  console.log("Streaming API INIT")
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    idleVideoElement = document.getElementById("idle-video-element");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    streamVideoElement = document.getElementById("stream-video-element");
    idleVideoElement.setAttribute("playsinline", "");
    streamVideoElement.setAttribute("playsinline", "");
    
    //init();
  }, []);


  const presenterInputByService = {
    talks: {
      source_url:
        "https://raw.githubusercontent.com/RCK-Games/rckbd/refs/heads/main/cashimiro__2_.png?token=GHSAT0AAAAAAC5T3ZTHXGA3UJQANT6OMDR2Z57XUPQ",
    },
    clips: {
      presenter_id: "v2_public_alex@qcvo4gupoy",
      driver_id: "e3nbserss8",
    },
  };
  let PRESENTER_TYPE;

  const init = async () => {
    if (DID_API.key === "🤫")
      alert("Please put your api key inside ./api.json and restart..");
    PRESENTER_TYPE = DID_API.service === "clips" ? "clip" : "talk";
    if (peerConnection && peerConnection.connectionState === "connected") {
      return;
    }
    makeConnection()
  };

  const makeConnection = async () => {
    console.log("CONNECTION INIT")
    try {
      stopAllStreams();
      closePC();

      ws = await connectToWebSocket(DID_API.websocketUrl, DID_API.key)
      // Step 2: Send "init-stream" message to WebSocket
      const startStreamMessage = {
        type: "init-stream",
        payload: {
          ...presenterInputByService[DID_API.service],
          presenter_type: PRESENTER_TYPE,
        },
      };
      sendMessage(ws, startStreamMessage);

      // Step 3: Handle WebSocket responses by message type
      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        // eslint-disable-next-line default-case
        switch (data.messageType) {
          case "init-stream":
            const {
              id: newStreamId,
              offer,
              ice_servers: iceServers,
              session_id: newSessionId,
            } = data;
            streamId = newStreamId;
            sessionId = newSessionId;

            try {
              sessionClientAnswer = await createPeerConnection(
                offer,
                iceServers
              );
              // Step 4: Send SDP answer to WebSocket
              const sdpMessage = {
                type: "sdp",
                payload: {
                  answer: sessionClientAnswer,
                  session_id: sessionId,
                  presenter_type: PRESENTER_TYPE,
                },
              };
              sendMessage(ws, sdpMessage);
            } catch (e) {
              console.error("Error during streaming setup", e);
              stopAllStreams();
              closePC();
              return;
            }
            break;

          case "sdp":
            console.log("SDP message received:", event.data);
            break;

          case "delete-stream":
            console.log("Stream deleted:", event.data);
            break;
        }
      };
    } catch (error) {
      console.error("Failed to connect and set up stream:", error.type);
    }
  };

  ///Accionar cuando se llame el sistema para hablar
  const sendWordToServer = async () => {
    let wordToStream
    const paragraph = document.getElementById("textHolder");
    if (paragraph) {
      wordToStream = paragraph.textContent;
    }
    let text
    if(wordToStream === undefined || wordToStream === null){
      text = "Hello world"
    }else{
      text = wordToStream
    }
    
    const chunks = text.split(" ");

    // Indicates end of text stream
    chunks.push("");

    // eslint-disable-next-line no-unused-vars
    for (const [_, chunk] of chunks.entries()) {
      const streamMessage = {
        type: "stream-text",
        payload: {
          script: {
            type: "text",
            input: chunk,
            provider: {
              type: "microsoft",
              voice_id: "es-MX-JorgeNeural",
            },
            ssml: true,
          },
          config: {
            stitch: true,
          },
          apiKeysExternal: {
            elevenlabs: { key: "" },
          },
          background: {
            color: "#FFFFFF",
          },
          session_id: sessionId,
          stream_id: streamId,
          presenter_type: PRESENTER_TYPE,
        },
      };
      sendMessage(ws, streamMessage);
    }
  };

  function onIceGatheringStateChange() {}

  function onIceCandidate(event) {
    console.log("onIceCandidate", event);
    if (event.candidate) {
      const { candidate, sdpMid, sdpMLineIndex } = event.candidate;
      sendMessage(ws, {
        type: "ice",
        payload: {
          session_id: sessionId,
          candidate,
          sdpMid,
          sdpMLineIndex,
        },
      });
    } else {
      sendMessage(ws, {
        type: "ice",
        payload: {
          stream_id: streamId,
          session_id: sessionId,
          presenter_type: PRESENTER_TYPE,
        },
      });
    }
  }
  function onIceConnectionStateChange() {
    if (
      peerConnection.iceConnectionState === "failed" ||
      peerConnection.iceConnectionState === "closed"
    ) {
      stopAllStreams();
      closePC();
    }
  }
  function onConnectionStateChange() {
    // not supported in firefox
    console.log("peerConnection", peerConnection.connectionState);
    if (peerConnection.connectionState === "failed") {
      init()
    }

    if(peerConnection === null){
      return
    }

    if (peerConnection.connectionState === "connected") {
      /**
       * A fallback mechanism: if the 'stream/ready' event isn't received within 5 seconds after asking for stream warmup,
       * it updates the UI to indicate that the system is ready to start streaming data.
       */
      setTimeout(() => {
        if (!isStreamReady) {
          console.log("forcing stream/ready");
          isStreamReady = true;
        }
      }, 5000);
    }
  }
  function onSignalingStateChange() {}

  function onVideoStatusChange(videoIsPlaying, stream) {
    if (videoIsPlaying) {
      streamVideoOpacity = isStreamReady ? 1 : 0;
      setStreamVideoElement(stream);
    } else {
      streamVideoOpacity = 0;
    }

    streamVideoElement.style.opacity = streamVideoOpacity;
    idleVideoElement.style.opacity = 1 - streamVideoOpacity;
  }

  function onTrack(event) {
    /**
     * The following code is designed to provide information about wether currently there is data
     * that's being streamed - It does so by periodically looking for changes in total stream data size
     *
     * This information in our case is used in order to show idle video while no video is streaming.
     * To create this idle video use the POST https://api.d-id.com/talks (or clips) endpoint with a silent audio file or a text script with only ssml breaks
     * https://docs.aws.amazon.com/polly/latest/dg/supportedtags.html#break-tag
     * for seamless results use `config.fluent: true` and provide the same configuration as the streaming video
     */

    if (!event.track) return;

    try{
      statsIntervalId = setInterval(async () => {

        if(peerConnection === null){
          clearInterval(statsIntervalId)
          return
        }
        try{
          const stats = await peerConnection.getStats(event.track);
          stats.forEach((report) => {
            if (report.type === "inbound-rtp" && report.kind === "video") {
              // eslint-disable-next-line no-mixed-operators
              const videoStatusChanged =
                videoIsPlaying !== report.bytesReceived > lastBytesReceived;
    
              if (videoStatusChanged) {
                videoIsPlaying = report.bytesReceived > lastBytesReceived;
                onVideoStatusChange(videoIsPlaying, event.streams[0]);
              }
              lastBytesReceived = report.bytesReceived;
            }
          });
        }catch(e){
          clearInterval(statsIntervalId)
          console.log("Crashed: " + e.message)
        }
        

      }, 500);
    }catch(e){
      console.log("Crashed: " + e.message)
    }

  }

  function onStreamEvent(message) {
    /**
     * This function handles stream events received on the data channel.
     * The 'stream/ready' event received on the data channel signals the end of the 2sec idle streaming.
     * Upon receiving the 'ready' event, we can display the streamed video if one is available on the stream channel.
     * Until the 'ready' event is received, we hide any streamed video.
     * Additionally, this function processes events for stream start, completion, and errors. Other data events are disregarded.
     */

    if (pcDataChannel.readyState === "open") {
      let status;
      // eslint-disable-next-line no-unused-vars
      const [event, _] = message.data.split(":");

      switch (event) {
        case "stream/started":
          status = "started";
          break;
        case "stream/done":
          status = "done";
          break;
        case "stream/ready":
          status = "ready";
          break;
        case "stream/error":
          status = "error";
          break;
        default:
          status = "dont-care";
          break;
      }

      // Set stream ready after a short delay, adjusting for potential timing differences between data and stream channels
      if (status === "ready") {
        setTimeout(() => {
          console.log("stream/ready");
          isStreamReady = true;
        }, 1000);
      } else {
        console.log(event);
      }
    }
  }

  async function createPeerConnection(offer, iceServers) {
    if (!peerConnection) {
      peerConnection = new RTCPeerConnection({ iceServers });
      pcDataChannel = peerConnection.createDataChannel("JanusDataChannel");
      peerConnection.addEventListener(
        "connectionstatechange",
        onConnectionStateChange,
        true
      );
      peerConnection.addEventListener("track", onTrack, true);
      pcDataChannel.addEventListener("message", onStreamEvent, true);
    }

    await peerConnection.setRemoteDescription(offer);
    console.log("set remote sdp OK");

    const sessionClientAnswer = await peerConnection.createAnswer();
    console.log("create local sdp OK");

    await peerConnection.setLocalDescription(sessionClientAnswer);
    console.log("set local sdp OK");

    return sessionClientAnswer;
  }

  function setStreamVideoElement(stream) {
    if (!stream) return;

    streamVideoElement.srcObject = stream;
    streamVideoElement.loop = false;
    streamVideoElement.mute = !isStreamReady;

    // safari hotfix
    if (streamVideoElement.paused) {
      streamVideoElement
        .play()
        .then((_) => {})
        .catch((e) => {});
    }
  }

  function playIdleVideo() {
    idleVideoElement.src =
      DID_API.service === "clips" ? "alex_v2_idle.mp4" : "emma_idle.mp4";
  }

  function stopAllStreams() {
    if (streamVideoElement.srcObject) {
      console.log("stopping video streams");
      streamVideoElement.srcObject.getTracks().forEach((track) => track.stop());
      streamVideoElement.srcObject = null;
      streamVideoOpacity = 0;
    }
  }

  function closePC(pc = peerConnection) {
    if (!pc) return;
    console.log("stopping peer connection");
    pc.close();
    pc.removeEventListener(
      "icegatheringstatechange",
      onIceGatheringStateChange,
      true
    );
    pc.removeEventListener("icecandidate", onIceCandidate, true);
    pc.removeEventListener(
      "iceconnectionstatechange",
      onIceConnectionStateChange,
      true
    );
    pc.removeEventListener(
      "connectionstatechange",
      onConnectionStateChange,
      true
    );
    pc.removeEventListener(
      "signalingstatechange",
      onSignalingStateChange,
      true
    );
    pc.removeEventListener("track", onTrack, true);
    pcDataChannel.removeEventListener("message", onStreamEvent, true);

    clearInterval(statsIntervalId);
    isStreamReady = !stream_warmup;
    streamVideoOpacity = 0;
    console.log("stopped peer connection");
    if (pc === peerConnection) {
      peerConnection = null;
    }
  }

  async function connectToWebSocket(url, token) {
    return new Promise((resolve, reject) => {
      const wsUrl = `${url}?authorization=Basic ${encodeURIComponent(token)}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connection opened.");
        resolve(ws);
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        reject(err);
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed.");
      };
    });
  }

  function sendMessage(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not open. Cannot send message.");
    }
  }

  return (
    <div className="AgentContainer">
      <div id="content">
        
          <video
            id="idle-video-element"
            autoPlay
            muted
            loop
            className="videoElementContainer"
            style={{ opacity: 1 }}
          ><source src={emma}  type="video/mp4" /></video>
          <video
            id="stream-video-element"
            autoPlay
            className="videoElementContainer"
            style={{ opacity: 0 }}
          ></video>
      </div>
      <button id="stream-word-button" type="button" style={{height: "0px", padding: "0px", margin: "0px",width: "0px", position: "absolute"}} onClick={sendWordToServer}>Stream word</button>
    </div>
  );
};

export default StreamingApi;
