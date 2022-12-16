import {
  DescribeVoicesCommand,
  Engine,
  LanguageCode,
  OutputFormat,
  SynthesizeSpeechCommand,
} from "@aws-sdk/client-polly";
import { useEffect, useRef, useState } from "react";
import { FormTextarea, Button, FormSelect } from "shards-react";
import header from "./assets/header.jpg";
import "./App.css";
import client from "./services/polly";

function App() {
  const [text, setText] = useState("Hello there.");
  const [voices, setVoices] = useState([]);
  const [voiceId, setVoiceId] = useState("Kevin");
  const [languageCode, setLanguageCode] = useState(LanguageCode.en_US);
  const [voicesLoading, setVoicesLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioDOMElementRef = useRef(null);

  const handleChange = (e) => {
    setText(e.target.value);
  };

  const handleLanguageChange = (e) => {
    setLanguageCode(e.target.value);
  };

  const handleVoiceChange = (e) => {
    setVoiceId(e.target.value);
  };

  useEffect(() => {
    (async () => {
      try {
        setVoicesLoading(true);
        const input = {
          Engine: Engine.NEURAL,
          LanguageCode: languageCode,
          IncludeAdditionalLanguageCodes: false,
        };
        const describeVoicesCommand = new DescribeVoicesCommand(input);
        const data = await client.send(describeVoicesCommand);
        setVoices(data.Voices);
        setVoiceId(data.Voices[0].Id);
        setVoicesLoading(false);
      } catch (err) {
        setVoices([]);
        setVoicesLoading(false);
        console.error(err);
      }
    })();
  }, [languageCode]);

  const handleListen = async () => {
    if (!audioDOMElementRef.current) return;
    try {
      setIsLoading(true);
      const input = {
        Engine: Engine.NEURAL,
        OutputFormat: OutputFormat.MP3,
        Text: text,
        TextType: "text",
        VoiceId: voiceId,
      };
      const synthesizeSpeechCommand = new SynthesizeSpeechCommand(input);
      const response = await client.send(synthesizeSpeechCommand);
      const data = new Response(response.AudioStream, {
        headers: {
          "Content-Type": "audio/mpeg",
        },
      });
      const blob = await data.blob();
      const url = URL.createObjectURL(blob);
      const audioDOMElement = audioDOMElementRef.current;
      const sourceDOMElement = audioDOMElement.querySelector("source");
      sourceDOMElement.src = url;
      audioDOMElement.load();
      setIsLoading(false);
      audioDOMElement.play();
    } catch (err) {
      setIsLoading(false);
      console.error(err);
    }
  };

  const handleStop = () => {
    if (!audioDOMElementRef.current) return;
    audioDOMElementRef.current.pause();
    setIsPlaying(false);
  };

  return (
    <div className="App">
      <div className="container">
        <img src={header} className="img-header" />
        {/* <h1>Amazon Polly showcase</h1> */}
        <div className="form">
          <label htmlFor="textarea">Enter text to convert to speech</label>
          <FormTextarea id="textarea" value={text} onChange={handleChange} />
          <div className="selects-wrapper">
            <div>
              <label htmlFor="language">Select a language:</label>
              <FormSelect
                id="language"
                value={languageCode}
                onChange={handleLanguageChange}
              >
                {Object.values(LanguageCode).map((language) => (
                  <option value={language} key={language}>
                    {language}
                  </option>
                ))}
              </FormSelect>
            </div>
            <div>
              <label htmlFor="voice">Select a voice:</label>
              <FormSelect
                id="voice"
                value={voiceId}
                onChange={handleVoiceChange}
                disabled={voicesLoading}
              >
                {voices.map((voice) => (
                  <option value={voice.Id} key={voice.Id}>
                    {voice.Name} - {voice.Gender}
                  </option>
                ))}
              </FormSelect>
            </div>
          </div>
          <audio
            ref={audioDOMElementRef}
            onPlay={() => {
              setIsPlaying(true);
            }}
            onEnded={() => {
              setIsPlaying(false);
            }}
          >
            <source type="audio/mpeg" />
          </audio>
          <Button
            theme="warning"
            className="button"
            disabled={!text || voicesLoading || isPlaying || isLoading}
            onClick={handleListen}
          >
            Listen
          </Button>
          {(isLoading || isPlaying) && (
            <Button className="button" theme="danger" onClick={handleStop}>
              Stop
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
