import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./Details.scss";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  generateConcepts,
  getBook,
  getCoverImages,
  updateBook,
} from "./service";
import Topbar from "../../../components/Topbar";
import {
  Button,
  ButtonVariantType,
  FlexContainer,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Radio,
  Select,
  ThemeType,
  SelectPropsConverter,
  SelectNative,
} from "basicui";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTimes,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import MainSection from "../../../components/MainSection";
import ConceptModel from "../../../model/BookModel";
import BookModel from "../../../model/BookModel";
import ImageComponent from "./ImageComponent";

interface Props {
  space: string;
  book: BookModel;
  onRefresh: any;
}

const Details = (props: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams();
  const navigate = useNavigate();
  const authorization = useSelector((state: any) => state.authorization);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditCoverOpen, setIsEditCoverOpen] = useState(false);
  const [state, setState] = useState<BookModel>();
  const [coverImages, setCoverImages] = useState<any[]>([]);

  useEffect(() => {
    setState({ ...props.book });
  }, [props.book]);

  const onEdit = () => {
    setIsOpen(true);
  };

  const onCancel = () => {
    setIsOpen(false);
  };

  const onEditCover = () => {
    setIsEditCoverOpen(true);
    refreshCoverImages();
  };

  const onCancelEditCover = () => {
    setIsEditCoverOpen(false);
  };

  const handleChange = (event: any) => {
    if (state) {
      setState({
        ...state,
        [event.currentTarget.name]: event.currentTarget.value,
      });
    }
  };

  const handleCoverImageChange = (event: any) => {
    if (state) {
      setState({
        ...state,
        [event.currentTarget.name]: event.currentTarget.value,
      });
    }
  };

  const onSave = () => {
    updateBook(props.space, props.book._id || "", state, authorization).then(
      (response) => {
        console.log(response);
        props.onRefresh();
        onCancel();
        onCancelEditCover();
      }
    );
  };

  const refreshCoverImages = () => {
    getCoverImages(props.space, props.book.reference || "", authorization).then(
      (response) => {
        setCoverImages(response);
      }
    );
  };

  return (
    <>
      <div className="book-page-details">
        <div>
          <h2>{props.book.title}</h2>
          <h5>
            <i>by {props.book.primaryAuthor}</i>
          </h5>
        </div>
        <div className="book-page-details__sources">
          <Link onClick={onEdit} theme={ThemeType.primary}>
            Edit details
          </Link>
          <Link onClick={onEditCover} theme={ThemeType.primary}>
            Edit cover
          </Link>
          <Link
            href={`/#/${props.space}/book/${props.book.reference}/extract`}
            theme={ThemeType.primary}
          >
            Sources
          </Link>
          {/* <a
          rel="noopener noreferrer"
          title="Sources"
          href={`/#/${props.space}/book/${props.book.reference}/concept`}
        >
          Key concepts
        </a> */}
        </div>
        <div>
          <p>Categories: {props.book.categories}</p>
          <p>
            {props.book.chapterCount} chapters, {props.book.pageCount} pages
          </p>
        </div>
        <p>{props.book.description}</p>
        <div>
          <h4>About the author</h4>
          <p>{props.book.authorInfo}</p>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={onCancel}>
        <ModalHeader onClose={onCancel} heading="Edit book details" />
        <ModalBody>
          <form className="form-two-column">
            <Input
              name="chapterCount"
              value={state?.chapterCount}
              onInput={handleChange}
              type="number"
              label="Chapter count"
              autoFocus
            />
            <SelectNative
              options={SelectPropsConverter.optionsFromSimpleList([
                "read",
                "currently-reading",
                "to-read",
              ])}
              name="readingProgress"
              // value={state?.readingProgress}
              value={state?.readingProgress}
              onInput={handleChange}
              label="Reading progress"
            />
            <Input
              name="startedReadingOn"
              value={state?.startedReadingOn}
              onInput={handleChange}
              type="date"
              label="Started reading"
            />
            <Input
              name="finishedReadingOn"
              value={state?.finishedReadingOn}
              onInput={handleChange}
              type="date"
              label="Finished reading"
            />
          </form>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onSave}>
            <FontAwesomeIcon icon={faCheck} />
            Save
          </Button>
          <Button onClick={onCancel}>
            <FontAwesomeIcon icon={faTimes} />
          </Button>
        </ModalFooter>
      </Modal>
      <Modal isOpen={isEditCoverOpen} onClose={onCancelEditCover}>
        <ModalHeader onClose={onCancelEditCover} heading="Change book cover" />
        <ModalBody>
          {coverImages.map((item) => (
            <>
              {item.thumbnail && (
                <FlexContainer alignX="center" alignY="middle" key={item.isbn}>
                  <Radio
                    checked={state?.thumbnail === item.thumbnail}
                    name="thumbnail"
                    value={item.thumbnail}
                    onChange={handleCoverImageChange}
                  />
                  <ImageComponent
                    imageUrl={item.thumbnail}
                    onClick={() =>
                      handleCoverImageChange({
                        currentTarget: {
                          name: "thumbnail",
                          value: item.thumbnail,
                        },
                      })
                    }
                  />
                </FlexContainer>
              )}
            </>
          ))}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onSave}>
            <FontAwesomeIcon icon={faCheck} />
            Save
          </Button>
          <Button onClick={onCancelEditCover}>
            <FontAwesomeIcon icon={faTimes} />
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default Details;
