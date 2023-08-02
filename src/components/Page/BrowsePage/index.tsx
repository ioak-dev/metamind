import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNodes, faListUl } from '@fortawesome/free-solid-svg-icons';
import './style.scss';
import Topbar from '../../../components/Topbar';
// import DisableContextBarCommand from '../../../events/DisableContextBarCommand';
import { searchNote } from './service';
import NoteModel from '../../../model/NoteModel';
import SearchResults from '../../../components/BrowseNotes/SearchResults';
import { isEmptyOrSpaces } from '../../../components/Utils';
import GraphSearchResultsView from '../../../components/GraphSearchResultsView';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from 'basicui';
import MainSection from '../../../components/MainSection';
import SearchInput from '../../../components/BrowseNotes/SearchInput';
import { getSessionValue, getSessionValueAsJson, setSessionValue, setSessionValueAsJson } from '../../../utils/SessionUtils';
import { SearchConfigType } from 'src/components/BrowseNotes/SearchInput/SearchConfig';
import { SearchOptionType } from 'src/components/BrowseNotes/SearchInput/SearchOptionType';
import MetadataDefinitionModel from 'src/model/MetadataDefinitionModel';

interface Props {
  location: any;
  space: string;
}

const BrowsePage = (props: Props) => {
  const navigate = useNavigate();
  const authorization = useSelector((state: any) => state.authorization);
  const dispatch = useDispatch();
  const metadataDefinitionList = useSelector((state: any) => state.metadataDefinition.items);
  const [searchByOptions, setSearchByOptions] = useState<SearchOptionType[]>([]);

  useEffect(() => {
    const _searchByOptions: SearchOptionType[] = [
      // {
      //   name: 'label',
      //   label: 'label'
      // }
    ];

    metadataDefinitionList.forEach((item: MetadataDefinitionModel) => {
      _searchByOptions.push({
        name: item._id || '',
        label: `${item.group} > ${item.name}`
      })
    })

    setSearchByOptions(_searchByOptions);
  }, [metadataDefinitionList]);

  return (
    <div className="page-animate">
      <Topbar title="Browse" space={props.space} />
      <MainSection>
        {/* <h2>Browse by group</h2> */}
        <div className="browse-page">
          <button className="browse-page__item">
            <div className="browse-page__item__left">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M345 39.1L472.8 168.4c52.4 53 52.4 138.2 0 191.2L360.8 472.9c-9.3 9.4-24.5 9.5-33.9 .2s-9.5-24.5-.2-33.9L438.6 325.9c33.9-34.3 33.9-89.4 0-123.7L310.9 72.9c-9.3-9.4-9.2-24.6 .2-33.9s24.6-9.2 33.9 .2zM0 229.5V80C0 53.5 21.5 32 48 32H197.5c17 0 33.3 6.7 45.3 18.7l168 168c25 25 25 65.5 0 90.5L277.3 442.7c-25 25-65.5 25-90.5 0l-168-168C6.7 262.7 0 246.5 0 229.5zM144 144a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z" /></svg>
            </div>
            <div className="browse-page__item__right">
              <div className="browse-page__item__right__top">
                label
              </div>
              <div className="browse-page__item__right__bottom">
              Descriptive labels that help categorize and index the content, making it easier to find relevant articles on specific topics
              </div>
            </div>
          </button>
          {searchByOptions.map((item) => <button className="browse-page__item">
            <div className="browse-page__item__left">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M418.4 157.9c35.3-8.3 61.6-40 61.6-77.9c0-44.2-35.8-80-80-80c-43.4 0-78.7 34.5-80 77.5L136.2 151.1C121.7 136.8 101.9 128 80 128c-44.2 0-80 35.8-80 80s35.8 80 80 80c12.2 0 23.8-2.7 34.1-7.6L259.7 407.8c-2.4 7.6-3.7 15.8-3.7 24.2c0 44.2 35.8 80 80 80s80-35.8 80-80c0-27.7-14-52.1-35.4-66.4l37.8-207.7zM156.3 232.2c2.2-6.9 3.5-14.2 3.7-21.7l183.8-73.5c3.6 3.5 7.4 6.7 11.6 9.5L317.6 354.1c-5.5 1.3-10.8 3.1-15.8 5.5L156.3 232.2z" /></svg>
            </div>
            <div className="browse-page__item__right">
              <div className="browse-page__item__right__top">
                {item.label}
              </div>
              <div className="browse-page__item__right__bottom">
                {item.name}
              </div>
            </div>
          </button>)}
        </div>
      </MainSection>
    </div>
  );
};

export default BrowsePage;
