import React, { useEffect, useRef, useState } from "react";
import "./style.scss";
import {
  Button,
  ButtonVariantType,
  IconButton,
  Input,
  Label,
  Textarea,
} from "basicui";
import {
  BlockQuote,
  Bold,
  BulletList,
  ClearFormatting,
  Editor,
  HighlightColor,
  Italic,
  OrderedList,
  Underline,
} from "writeup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophoneAlt,
  faStop,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import AiAssist from "../../../../../components/NewNote/AiAssist";
import SectionModel from "../../../../../model/SectionModel";

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  // Other properties as needed
}

interface SpeechRecognitionResultList
  extends Array<SpeechRecognitionResult[]> {}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface Props {
  space: string;
  section: SectionModel;
  onChange: any;
  editor: any;
}

const HeadEditor = (props: Props) => {
  const [isAiAssistOpen, setIsAiAssistOpen] = useState(false);

  const onReplaceContentFromAssist = (_text: string) => {
    props.editor?.commands.setContent(_text);
  };

  const handleChange = (event: any) => {
    props.onChange({
      ...props.section,
      [event.currentTarget.name]: event.currentTarget.value,
    });
  };

  return (
    <>
      <div className="head-editor">
        <Input
          value={props.section.title}
          name="title"
          label="Chapter title"
          onInput={handleChange}
          autoFocus
        />
        <Editor editor={props.editor}>
          <Bold editor={props.editor} />
          <Italic editor={props.editor} />
          <Underline editor={props.editor} />
          <BulletList editor={props.editor} />
          <OrderedList editor={props.editor} />
          <BlockQuote editor={props.editor} />
          <HighlightColor editor={props.editor} />
          <ClearFormatting editor={props.editor} />
        </Editor>
        <div>
          <Button
            onClick={() => setIsAiAssistOpen(true)}
            // loading={isRecording}
            variant={ButtonVariantType.transparent}
          >
            <FontAwesomeIcon icon={faWandMagicSparkles} />
            AI assist
          </Button>
        </div>
      </div>
      <AiAssist
        space={props.space}
        isOpen={isAiAssistOpen}
        setIsOpen={setIsAiAssistOpen}
        initialContent={props.editor?.getHTML()}
        onUpdate={onReplaceContentFromAssist}
      />
    </>
  );
};

export default HeadEditor;
