import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./style.scss";
import Topbar from "../../../components/Topbar";
import { useParams } from "react-router-dom";
import MainSection from "../../../components/MainSection";
import { getBookdetailList, saveBookdetail } from "./service";
import { getEditorConfig } from "../../../utils/EditorUtils";
import SectionContainer from "./SectionContainer";
import AddNewSection from "./AddNewSection";
import BookSectionDetailModel from "../../../model/BookSectionDetailModel";
import SectionModel from "../../../model/SectionModel";
import { getSectionByReference } from "../BookSectionPage/service";
import { getBookGenerationLog } from "../BookPage/service";
import BookLogModel from "../../../model/BookLogModel";
import SectionSeed from "./SectionSeed";
interface Props {
  space: string;
}

const BookSectionDetailPage = (props: Props) => {
  const headEditor = getEditorConfig();

  const params = useParams();
  const dispatch = useDispatch();
  const authorization = useSelector((state: any) => state.authorization);
  const [bookSectionDetailList, setBookdetailList] = useState<
    BookSectionDetailModel[]
  >([]);
  const [bookSection, setBookSection] = useState<SectionModel>();
  const [saving, setSaving] = useState(false);
  const [isEditHead, setIsEditHead] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [state, setState] = useState<BookSectionDetailModel>({
    content: "",
    type: "",
  });
  const [log, setLog] = useState<BookLogModel[]>([]);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const isPolling = useRef<boolean>(false);

  useEffect(() => {
    if (params.bookref && params.sectionref && authorization.isAuth) {
      _refreshSection();
      _refreshBookdetailList();
      _startPolling();
    }
  }, [params, authorization]);

  useEffect(() => {
    return () => {
      _stopPolling();
    };
  }, []);

  const _refreshBookdetailList = () => {
    if (params.bookref && params.sectionref && authorization.isAuth) {
      getBookdetailList(
        props.space,
        params.bookref,
        params.sectionref,
        authorization
      ).then((response) => {
        setBookdetailList(response);
      });
    }
  };

  const _refreshSection = () => {
    if (params.bookref && params.sectionref && authorization.isAuth) {
      getSectionByReference(
        props.space,
        params.bookref,
        params.sectionref,
        authorization
      ).then((response) => {
        setBookSection(response);
      });
    }
  };

  const _startPolling = () => {
    if (!isPolling.current) {
      isPolling.current = true;
      _poll();
    }
  };

  const _poll = () => {
    getBookGenerationLog(
      props.space,
      authorization,
      params.bookref || "",
      params.sectionref || ""
    ).then((response) => {
      setLog(response);
      if (response.length > 0) {
        pollingRef.current = setTimeout(_poll, 3000);
      } else {
        _refreshBookdetailList();
        _stopPolling();
      }
    });
  };

  const _stopPolling = () => {
    if (isPolling.current) {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
      }
      pollingRef.current = null;
      isPolling.current = false;
    }
  };

  const onEditHead = () => {
    setIsEditHead(true);
    setIsEdit(true);
  };

  const onCancelHead = () => {
    setIsEditHead(false);
    setIsEdit(false);
  };

  const onSave = (event: any, reload?: boolean) => {
    setSaving(true);
    saveBookdetail(props.space, { ...state }, authorization)
      .then((response) => {
        setIsEditHead(false);
        setIsEdit(false);
        setSaving(false);
      })
      .catch(() => setSaving(false));
  };

  const onRefresh = () => {
    _refreshBookdetailList();
    _startPolling();
  };

  return (
    <>
      <div className="note-page page-animate">
        <Topbar title={bookSection?.title || ""} />

        <MainSection className="book-section-detail-page">
          {bookSection && (
            <SectionSeed
              onRefresh={_refreshSection}
              section={bookSection}
              space={props.space}
            />
          )}
          {bookSection &&
            bookSectionDetailList?.map((item) => (
              <SectionContainer
                key={item._id}
                space={props.space}
                bookSectionDetail={item}
                bookSection={bookSection}
                onRefresh={onRefresh}
                log={log}
              />
            ))}
          {log.length === 0 && (
            <AddNewSection
              space={props.space}
              onRefresh={onRefresh}
              bookSectionDetailList={bookSectionDetailList}
            />
          )}
        </MainSection>
      </div>
    </>
  );
};

export default BookSectionDetailPage;
