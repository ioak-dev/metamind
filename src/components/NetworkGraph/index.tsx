/* eslint-disable no-plusplus */
import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { usePopper } from 'react-popper';
import { addDays, format } from 'date-fns';
import {
  faCheck,
  faGear,
  faPlus,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as d3 from 'd3';
import { cloneDeep } from 'lodash';

import './style.scss';
import NoteModel from '../../model/NoteModel';
import NotelinkModel from '../../model/NotelinkModel';
import LinkModel from '../../model/LinkModel';
import NodeModel from '../../model/NodeModel';
import FilterGroup from './FilterGroup';
import { getFilterGroup, updateFilterGroup } from './service';
import BinaryChoiceInput from './BinaryChoiceInput';

const queryString = require('query-string');

interface Props {
  offsetX?: number;
  offsetY?: number;
  space: string;
  data: { nodes: NodeModel[]; links: LinkModel[] };
  children?: any;
  focusNodeRef?: string;
}

const THEME = {
  DARK_BG: '#2c2c2c',
  LIGHT_BG: '#fafafa',
  DARK_TEXT: '#fcfcfc',
  LIGHT_TEXT: '#0a0a0a',
};

const NetworkGraph = (props: Props) => {
  const svgRef = React.useRef<any>(null);
  const divRef = React.useRef(null);
  const history = useHistory();

  const authorization = useSelector((state: any) => state.authorization);
  const profile = useSelector((state: any) => state.profile);
  const companyList = useSelector((state: any) => state.company.items);
  const [data, setData] = useState<any>();
  const [references, setReferences] = useState<any>({});
  const [filterGroup, setFilterGroup] = useState<any[]>([]);

  const [hideOrphanNodes, setHideOrphanNodes] = useState(false);
  const [disableNodeColors, setDisableNodeColors] = useState(false);
  const [dynamicNodeSize, setDynamicNodeSize] = useState(true);

  const [svg, setSvg] = useState<any>();
  const referenceElement = useRef<any>(null);
  const popperElement = useRef<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState({
    charge: -300,
    distance: 10,
    collision: 1,
    center: 0.5,
    fontSize: 12,
    fontOpacity: 5,
    linkOpacity: 5,
    linkThickness: 0.5,
    nodeSize: 25,
    textFade: -1000,
  });
  const [textNode, setTextNode] = useState<any>();
  const [linkNode, setLinkNode] = useState<any>();
  const [eventNode, setEventNode] = useState<any>();
  const [simulation, setSimulation] = useState<any>();

  useEffect(() => {
    if (authorization.isAuth) {
      getFilterGroup(props.space, authorization).then((response: any) => {
        if (response) {
          setFilterGroup(response);
        }
      });
    }
  }, [authorization]);

  const nodeColor = d3
    .scaleOrdinal()
    .domain(['note', 'tag'])
    .range(['#7c7c7c', '#d39e6a']);
  const nodeColorDark = d3
    .scaleOrdinal()
    .domain(['note', 'tag'])
    .range(['#c1c1c1', '#ab7948']);

  const { styles, attributes, update, forceUpdate } = usePopper(
    referenceElement.current,
    popperElement.current,
    {
      placement: 'top-end',
      modifiers: [
        {
          name: 'flip',
          enabled: true,
          options: {
            fallbackPlacements: [
              'bottom-end',
              'right-end',
              'right-start',
              'right',
              'auto',
            ],
          },
        },
        {
          name: 'offset',
          enabled: true,
          options: {
            offset: [0, 6],
          },
        },
        {
          name: 'eventListeners',
          options: { scroll: false },
        },
      ],
    }
  );

  const togglePopup = (event: any) => {
    event.preventDefault();
    if (update) {
      update().then(() => {});
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const dataCopy = cloneDeep(props.data);
    const _data: any = {};
    const validNoteRefList: string[] = [];
    dataCopy.nodes.forEach((item: NodeModel) => {
      validNoteRefList.push(item.reference);
    });
    _data.links = dataCopy.links.filter(
      (item: any) =>
        validNoteRefList.includes(item.source) &&
        validNoteRefList.includes(item.target)
    );
    const nodeCountMap: any = {};
    const _references: any = {};
    _data.links.forEach((item: any) => {
      nodeCountMap[item.source] = (nodeCountMap[item.source] || 0) + 1;
      nodeCountMap[item.target] = (nodeCountMap[item.target] || 0) + 1;
      _references[item.source] = [
        ...(_references[item.source] || []),
        item.target,
      ];
      _references[item.target] = [
        ...(_references[item.target] || []),
        item.source,
      ];
    });
    _data.nodes = dataCopy.nodes;
    _data.nodes = dataCopy.nodes.map((item: NodeModel) => {
      if (nodeCountMap[item.reference]) {
        return {
          ...item,
          weight:
            nodeCountMap[item.reference] + state.nodeSize - 1 <=
            state.nodeSize * 5
              ? nodeCountMap[item.reference] + state.nodeSize - 1
              : state.nodeSize * 5,
        };
      }
      return {
        ...item,
        weight: 9,
      };
    });

    if (hideOrphanNodes) {
      _data.nodes = _data.nodes.filter(
        (item: any) => !!nodeCountMap[item.reference]
      );
    }

    setData(_data);
    setReferences(_references);
  }, [props.data, state.nodeSize, hideOrphanNodes]);

  useEffect(() => {
    simulateNetwork();
  }, [
    profile,
    data,
    disableNodeColors,
    dynamicNodeSize,
    props.offsetX,
    props.offsetY,
  ]);

  useEffect(() => {
    modifyForceParameters();
    // simulateNetwork();
  }, [
    state.charge,
    state.collision,
    state.fontSize,
    state.linkThickness,
    state.fontOpacity,
    state.linkOpacity,
    state.textFade,
  ]);

  useEffect(() => {
    simulateNetwork();
  }, [state.distance, state.nodeSize]);

  useEffect(() => {
    if (eventNode) {
      eventNode
        .on('click', function (e: any, d: any) {
          if (d.group === 'note') {
            history.push(`/${props.space}/note?id=${d.reference}`);
          } else {
            history.push(`/${props.space}/search?text=tag:${d.reference}`);
          }
        })
        .on('mouseenter', (evt: any, d: any) => {
          linkNode
            .attr('stroke-opacity', 0.05)
            .filter(
              (l: any) =>
                l.source.reference === d.reference ||
                l.target.reference === d.reference
            )
            .attr('stroke-opacity', state.linkOpacity / 10);
          eventNode
            .style('opacity', 0.2)
            // .style('fill', function (d: any) {
            //   return d.color;
            // })
            .filter(
              (n: any) =>
                n.reference === d.reference ||
                (references[d.reference] &&
                  references[d.reference].includes(n.reference))
            )
            .style('opacity', 1);
          // .style('fill', function (d: any) {
          //   return d.color;
          // });

          textNode
            .style('opacity', '0')
            .filter(
              (t: any) =>
                t.reference === d.reference ||
                (references[d.reference] &&
                  references[d.reference].includes(t.reference))
            )
            .style('opacity', state.fontOpacity / 10);

          if (state.charge > state.textFade) {
            textNode
              .filter((t: any) => t.reference === d.reference)
              .style('opacity', '0')
              .style('display', 'block')
              .style('opacity', state.fontOpacity / 10);
          }
        })
        .on('mouseleave', (evt: any, d: any) => {
          // link.attr('display', 'block');
          linkNode.attr('stroke-opacity', state.linkOpacity / 10);
          eventNode.style('opacity', 1);
          // eventNode.style('fill', function (d: any) {
          //   return d.color;
          // });

          textNode.style('opacity', state.fontOpacity / 10);
          if (state.charge > state.textFade) {
            textNode
              .filter((t: any) => t.reference === d.reference)
              .style('display', 'none')
              .style('opacity', 0)
              .style('opacity', state.fontOpacity / 10);
          }
        });
    }
  }, [
    eventNode,
    state.fontOpacity,
    state.linkOpacity,
    state.textFade,
    state.charge,
  ]);

  const modifyForceParameters = () => {
    if (simulation) {
      simulation
        .force('charge', d3.forceManyBody().strength(state.charge))
        .force(
          'collide',
          d3
            .forceCollide()
            .radius(
              (d: any) =>
                (dynamicNodeSize
                  ? Math.sqrt(d.weight || state.nodeSize)
                  : Math.sqrt(state.nodeSize)) + state.collision
            )
        );
      // .force('link', d3.forceLink().distance(state.distance).strength(0.1));
      simulation.alpha(0.1).restart();
    }

    if (textNode) {
      textNode
        .style('font-size', `${state.fontSize}px`)
        .style('opacity', state.fontOpacity / 10);
      if (state.charge > state.textFade) {
        textNode.style('display', 'none');
      } else {
        textNode.style('display', 'block');
      }
    }

    if (linkNode) {
      linkNode
        .attr('stroke-opacity', state.linkOpacity / 10)
        .attr('stroke-width', state.linkThickness);
    }
  };

  const simulateNetwork = () => {
    const height = window.innerHeight - 50 - (props.offsetY || 0);
    let width = window.innerWidth - 80 - (props.offsetX || 0);
    if (profile.sidebar) {
      width -= 350;
    }
    // if (profile.contextbar) {
    //   width -= 350;
    // }

    svgRef.current?.setAttribute('height', height);
    svgRef.current?.setAttribute('width', width);
    const svgEl: any = d3.select(svgRef.current);
    svgEl.selectAll('*').remove(); // Clear svg content before adding new elementsvar g = svg.append("g")
    const g = svgEl.append('g').attr('class', 'everything');
    const linkColor = d3
      .scaleOrdinal()
      .domain(['', 'ai', 'link'])
      .range([
        profile.theme === 'theme_dark' ? THEME.DARK_TEXT : THEME.LIGHT_TEXT,
        '#A500B1',
        '#DD3D1C',
      ]);
    const r = 20;
    const _nodes = data?.nodes;
    const _links = data?.links;
    let _simulation: any = null;
    let node: any = null;
    let link: any = null;
    let forceLink: any = null;
    let text: any = null;
    if (_nodes) {
      // svgEl
      //   .append('svg:defs')
      //   .selectAll('marker')
      //   .data(['end']) // Different link/path types can be defined here
      //   .enter()
      //   .append('svg:marker') // This section adds in the arrows
      //   .attr('id', String)
      //   .attr('viewBox', '0 -5 10 10')
      //   .attr('refX', 68)
      //   .attr('refY', 0)
      //   .attr('markerWidth', 6)
      //   .attr('markerHeight', 6)
      //   .attr('orient', 'auto')
      //   .append('path')
      //   .attr('d', 'M0,-5L10,0L0,5')
      //   .attr('fill', '#999');
      forceLink = d3
        .forceLink()
        .links(_links)
        .id((d: any) => d.reference)
        .distance(state.distance);
      _simulation = d3
        .forceSimulation(_nodes)
        .force('x', d3.forceX(width / 2))
        .force('y', d3.forceY(height / 2))
        .force(
          'link',
          forceLink.distance(state.distance)
          // .distance((d: any) => 30 + 30 * (1 - 0.8))
          // .strength(0.1)
        )
        .force(
          'collide',
          d3
            .forceCollide()
            .radius(
              (d: any) =>
                (dynamicNodeSize
                  ? Math.sqrt(d.weight || state.nodeSize)
                  : Math.sqrt(state.nodeSize)) + state.collision
            )
        )
        .force('charge', d3.forceManyBody().strength(state.charge))
        .force('center', d3.forceCenter(width / 2, height / 2));

      link = g
        .append('g')
        .attr(
          'stroke',
          profile.theme === 'theme_dark' ? THEME.DARK_TEXT : THEME.LIGHT_TEXT
        )
        .attr('stroke-opacity', state.linkOpacity / 10)
        .selectAll('line')
        .data(_links)
        .join('line')
        .attr('stroke', function (d: any) {
          return linkColor(d.group);
        })
        .attr('stroke-width', state.linkThickness);
      // .attr('marker-end', 'url(#end)');

      node = g
        .append('g')
        .selectAll('.node')
        .data(_nodes)
        .join('g')
        .attr('class', 'node')
        .style('fill', function (d: any) {
          if (props.focusNodeRef && d.reference === props.focusNodeRef) {
            return profile.theme === 'theme_dark'
              ? THEME.DARK_BG
              : THEME.LIGHT_BG;
          }
          if (d.color && !disableNodeColors) {
            return d.color;
          }
          return profile.theme === 'theme_dark'
            ? nodeColorDark(d.group)
            : nodeColor(d.group);
        })
        .call(drag(_simulation));

      text = node
        .append('text')
        .text(function (d: any) {
          return d.name;
        })
        .style(
          'fill',
          profile.theme === 'theme_dark' ? THEME.DARK_TEXT : THEME.LIGHT_TEXT
        )
        .style('opacity', state.fontOpacity / 10)
        .style('font-size', `${state.fontSize}px`)
        .style('font-weight', '400')
        .attr('x', 10)
        .attr('y', 4);

      if (state.charge > state.textFade) {
        text.style('display', 'none');
      }

      setTextNode(text);

      const _eventNode = node
        .append('circle')
        .attr('r', function (d: any) {
          return dynamicNodeSize
            ? Math.sqrt(d.weight || state.nodeSize)
            : Math.sqrt(state.nodeSize);
        })
        // .attr('fill', '#AE65FF')
        .attr('stroke-width', 1)
        .attr('stroke', function (d: any) {
          if (props.focusNodeRef && d.reference === props.focusNodeRef) {
            return profile.theme === 'theme_dark'
              ? THEME.DARK_TEXT
              : THEME.LIGHT_TEXT;
          }
          return profile.theme === 'theme_dark'
            ? THEME.DARK_BG
            : THEME.LIGHT_BG;
        });

      setEventNode(_eventNode);

      _simulation.on('tick', () => {
        link
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);

        node.attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);
      });

      const zoomHandler = d3.zoom().on('zoom', zoomActions);

      zoomHandler(svgEl);

      // node.on('click', function (d: any, e: any) {
      //   history.push(`/${props.space}/note?id=${e._id}`);
      // });

      setSvg(svgEl);
      setSimulation(_simulation);
      setTextNode(text);
      setLinkNode(link);
    }

    function zoomActions(event: any) {
      g.attr('transform', event.transform);
      // simulation.force(
      //   'charge',
      //   d3.forceManyBody().strength(-50 - event.transform.k * 10)
      // );
      // simulation.alpha(0.1).restart();
    }

    function drag(_simulation: any) {
      function dragstarted(event: any) {
        if (!event.active) _simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: any) {
        if (!event.active) _simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3
        .drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }
  };

  const handleSliderChange = (event: any) => {
    setState({
      ...state,
      [event.target.name]: parseInt(event.target.value, 10),
    });
  };

  const handleSliderReverseChange = (event: any) => {
    setState({
      ...state,
      [event.target.name]: 0 - parseInt(event.target.value, 10),
    });
  };

  const handleUpdateFilterGroup = (payload: any) => {
    updateFilterGroup(props.space, payload, authorization).then(
      (response: any) => {}
    );
  };

  return (
    <div className="network-graph" ref={divRef}>
      <svg ref={svgRef} />
      <div className="network-graph__control">
        <button
          className={`button network-graph__control__button ${
            isOpen
              ? 'network-graph__control__button--active'
              : 'network-graph__control__button--inactive'
          }`}
          onClick={togglePopup}
          ref={referenceElement}
        >
          <FontAwesomeIcon icon={faGear} />
        </button>
        <div
          className="bg-light-300 dark:bg-dark-400"
          ref={popperElement}
          style={styles.popper}
          {...attributes.popper}
        >
          {isOpen && (
            <div className="network-graph__control__content">
              <div className="network-graph__control__content__related-group">
                <BinaryChoiceInput
                  label="Hide orphan nodes"
                  value={hideOrphanNodes}
                  handleUpdate={(value: boolean) => setHideOrphanNodes(value)}
                />
                <BinaryChoiceInput
                  label="Dynamic node size"
                  value={dynamicNodeSize}
                  handleUpdate={(value: boolean) => setDynamicNodeSize(value)}
                />
                <BinaryChoiceInput
                  label="Disable node colors"
                  value={disableNodeColors}
                  handleUpdate={(value: boolean) => setDisableNodeColors(value)}
                />
                {props.children && <>{props.children}</>}
              </div>

              {!disableNodeColors && (
                <div className="network-graph__control__content__container">
                  <div className="network-graph__control__content__title">
                    Groups
                  </div>
                  <div className="network-graph__control__content__body">
                    <FilterGroup
                      space={props.space}
                      data={filterGroup}
                      handleUpdate={handleUpdateFilterGroup}
                    />
                  </div>
                </div>
              )}

              <div className="network-graph__control__content__container">
                <div className="network-graph__control__content__title">
                  Forces
                </div>
                <div className="network-graph__control__content__body">
                  <div className="network-graph__control__content__body__item">
                    <label>Repel force-{state.charge}</label>
                    <input
                      type="range"
                      min="-10"
                      max="10000"
                      onChange={handleSliderReverseChange}
                      name="charge"
                      value={0 - state.charge}
                      className="ui-slider"
                    />
                  </div>
                  <div className="network-graph__control__content__body__item">
                    <label>Collide force</label>
                    <input
                      type="range"
                      min="-100"
                      max="10"
                      onChange={handleSliderReverseChange}
                      name="collision"
                      value={0 - state.collision}
                      className="ui-slider"
                    />
                  </div>
                  <div className="network-graph__control__content__body__item">
                    <label>Link distance (experimental)</label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      onChange={handleSliderChange}
                      name="distance"
                      value={state.distance}
                      className="ui-slider"
                    />
                  </div>
                  <div className="network-graph__control__content__body__item">
                    <label>Font size</label>
                    <input
                      type="range"
                      min="8"
                      max="30"
                      onChange={handleSliderChange}
                      name="fontSize"
                      value={state.fontSize}
                      className="ui-slider"
                    />
                  </div>
                  <div className="network-graph__control__content__body__item">
                    <label>Text opacity</label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      onChange={handleSliderChange}
                      name="fontOpacity"
                      value={state.fontOpacity}
                      className="ui-slider"
                    />
                  </div>
                  <div className="network-graph__control__content__body__item">
                    <label>Text fade threshold</label>
                    <input
                      type="range"
                      min="-10"
                      max="10000"
                      onChange={handleSliderReverseChange}
                      name="textFade"
                      value={0 - state.textFade}
                      className="ui-slider"
                    />
                  </div>
                  <div className="network-graph__control__content__body__item">
                    <label>Link opacity</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      onChange={handleSliderChange}
                      name="linkOpacity"
                      value={state.linkOpacity}
                      className="ui-slider"
                    />
                  </div>
                  <div className="network-graph__control__content__body__item">
                    <label>Link thickness</label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      onChange={handleSliderChange}
                      name="linkThickness"
                      value={state.linkThickness}
                      className="ui-slider"
                    />
                  </div>
                  <div className="network-graph__control__content__body__item">
                    <label>Node size</label>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      onChange={handleSliderChange}
                      name="nodeSize"
                      value={state.nodeSize}
                      className="ui-slider"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkGraph;
