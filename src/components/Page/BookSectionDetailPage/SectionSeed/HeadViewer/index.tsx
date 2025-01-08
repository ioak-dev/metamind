import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./style.scss";
import SectionModel from "../../../../../model/SectionModel";
import { Link, ThemeType } from "basicui";

interface Props {
  index?: number;
  space: string;
  section: SectionModel;
}

const HeadViewer = (props: Props) => {
  return (
    <div className="book-section-page-head-viewer">
      <h4>{props.section.title}</h4>
      <div
        dangerouslySetInnerHTML={{ __html: props.section.description || "" }}
      />
    </div>
  );
};

export default HeadViewer;
