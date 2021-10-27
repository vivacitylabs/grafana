// Libraries
import React, { PureComponent, CSSProperties, useRef, useEffect } from 'react';
import ReactGridLayout, { ItemCallback } from 'react-grid-layout';
import classNames from 'classnames';
import AutoSizer from 'react-virtualized-auto-sizer';

// Components
import { AddPanelWidget } from '../components/AddPanelWidget';
import { DashboardRow } from '../components/DashboardRow';

// Types
import { GRID_CELL_HEIGHT, GRID_CELL_VMARGIN, GRID_COLUMN_COUNT } from 'app/core/constants';
import { DashboardPanel } from './DashboardPanel';
import { DashboardModel, PanelModel } from '../state';
import { Subscription } from 'rxjs';
import { DashboardPanelsChangedEvent } from 'app/types/events';
import { GridPos } from '../state/PanelModel';
import { config } from '@grafana/runtime';

export const DASHBOARD_SCROLLBAR_ID = 'dashboard-page-scroll-bar';
const DASHBOARD_SCROLL_SELECTOR = `#${DASHBOARD_SCROLLBAR_ID} > .scrollbar-view`;

export interface Props {
  dashboard: DashboardModel;
  editPanel: PanelModel | null;
  viewPanel: PanelModel | null;
  scrollTop: number;
}

export interface State {
  isLayoutInitialized: boolean;
}

export class DashboardGrid extends PureComponent<Props, State> {
  private panelMap: Record<string, PanelModel> = {};
  private eventSubs = new Subscription();
  private windowHeight = 1200;
  private windowWidth = 1920;
  private gridWidth = 0;
  private observer?: IntersectionObserver;

  constructor(props: Props) {
    super(props);

    this.state = {
      isLayoutInitialized: false,
    };
  }

  componentDidMount() {
    const { dashboard } = this.props;
    this.eventSubs.add(dashboard.events.subscribe(DashboardPanelsChangedEvent, this.triggerForceUpdate));

    this.observer = new IntersectionObserver(this.intersectionHandler.bind(this), {
      root: document.querySelector(DASHBOARD_SCROLL_SELECTOR),
      rootMargin: '15%',
    });
  }

  componentWillUnmount() {
    this.eventSubs.unsubscribe();
  }

  private intersectionHandler(entries: IntersectionObserverEntry[]) {
    for (const entry of entries) {
      const panelId = entry.target.getAttribute('data-panelid') ?? '';
      const panel = this.panelMap[panelId];
      if (panel) {
        const { isIntersecting } = entry;
        panel.isInView = isIntersecting;
      }
    }

    // This this.state.isLayoutInitialized used to be set in onLayoutChange the first time we render to correct any invalid grid positions.
    // Because we're now tracking intersections we need to set the panel.isInView prop before re rendering.
    // Otherwise all panels will have panel.isInView === false on first render.
    if (!this.state.isLayoutInitialized) {
      this.setState({ isLayoutInitialized: true });
    }
  }

  buildLayout() {
    const layout = [];
    this.panelMap = {};

    for (const panel of this.props.dashboard.panels) {
      if (!panel.key) {
        panel.key = `panel-${panel.id}-${Date.now()}`;
      }
      this.panelMap[panel.key] = panel;

      if (!panel.gridPos) {
        console.log('panel without gridpos');
        continue;
      }

      const panelPos: any = {
        i: panel.key,
        x: panel.gridPos.x,
        y: panel.gridPos.y,
        w: panel.gridPos.w,
        h: panel.gridPos.h,
      };

      if (panel.type === 'row') {
        panelPos.w = GRID_COLUMN_COUNT;
        panelPos.h = 1;
        panelPos.isResizable = false;
        panelPos.isDraggable = panel.collapsed;
      }

      layout.push(panelPos);
    }

    return layout;
  }

  onLayoutChange = (newLayout: ReactGridLayout.Layout[]) => {
    for (const newPos of newLayout) {
      this.panelMap[newPos.i!].updateGridPos(newPos);
    }

    this.props.dashboard.sortPanelsByGridPos();
  };

  triggerForceUpdate = () => {
    this.forceUpdate();
  };

  updateGridPos = (item: ReactGridLayout.Layout, layout: ReactGridLayout.Layout[]) => {
    this.panelMap[item.i!].updateGridPos(item);
  };

  onResize: ItemCallback = (layout, oldItem, newItem) => {
    const panel = this.panelMap[newItem.i!];
    panel.updateGridPos(newItem);
    panel.configRev++; // trigger change handler
  };

  onResizeStop: ItemCallback = (layout, oldItem, newItem) => {
    this.updateGridPos(newItem, layout);
  };

  onDragStop: ItemCallback = (layout, oldItem, newItem) => {
    this.updateGridPos(newItem, layout);
  };

  renderPanels(gridWidth: number) {
    const panelElements = [];

    // This is to avoid layout re-flows, accessing window.innerHeight can trigger re-flow
    // We assume here that if width change height might have changed as well
    if (this.gridWidth !== gridWidth) {
      this.windowHeight = window.innerHeight ?? 1000;
      this.windowWidth = window.innerWidth;
      this.gridWidth = gridWidth;
    }

    for (const panel of this.props.dashboard.panels) {
      const panelClasses = classNames({ 'react-grid-item--fullscreen': panel.isViewing });

      panelElements.push(
        <GrafanaGridItem
          observer={this.observer}
          key={panel.key}
          className={panelClasses}
          data-panelid={panel.key}
          gridPos={panel.gridPos}
          gridWidth={gridWidth}
          windowHeight={this.windowHeight}
          windowWidth={this.windowWidth}
          isViewing={panel.isViewing}
        >
          {(width: number, height: number) => {
            return this.renderPanel(panel, width, height);
          }}
        </GrafanaGridItem>
      );
    }

    return panelElements;
  }

  renderPanel(panel: PanelModel, width: any, height: any) {
    if (panel.type === 'row') {
      return <DashboardRow key={panel.key} panel={panel} dashboard={this.props.dashboard} />;
    }

    if (panel.type === 'add-panel') {
      return <AddPanelWidget key={panel.key} panel={panel} dashboard={this.props.dashboard} />;
    }

    return (
      <DashboardPanel
        key={panel.key}
        stateKey={panel.key}
        panel={panel}
        dashboard={this.props.dashboard}
        isEditing={panel.isEditing}
        isViewing={panel.isViewing}
        isInView={panel.isInView}
        width={width}
        height={height}
      />
    );
  }

  render() {
    const { dashboard } = this.props;
    return (
      /**
       * We have a parent with "flex: 1 1 0" we need to reset it to "flex: 1 1 auto" to have the AutoSizer
       * properly working. For more information go here:
       * https://github.com/bvaughn/react-virtualized/blob/master/docs/usingAutoSizer.md#can-i-use-autosizer-within-a-flex-container
       */
      <div style={{ flex: '1 1 auto' }}>
        <AutoSizer disableHeight>
          {({ width }) => {
            if (width === 0) {
              return null;
            }

            const draggable = width <= 769 ? false : dashboard.meta.canEdit;

            /*
            Disable draggable if mobile device, solving an issue with unintentionally
            moving panels. https://github.com/grafana/grafana/issues/18497
            theme.breakpoints.md = 769
          */

            return (
              /**
               * The children is using a width of 100% so we need to guarantee that it is wrapped
               * in an element that has the calculated size given by the AutoSizer. The AutoSizer
               * has a width of 0 and will let its content overflow its div.
               */
              <div style={{ width: `${width}px`, height: '100%' }}>
                <ReactGridLayout
                  width={width}
                  isDraggable={draggable}
                  isResizable={dashboard.meta.canEdit}
                  containerPadding={[0, 0]}
                  useCSSTransforms={false}
                  margin={[GRID_CELL_VMARGIN, GRID_CELL_VMARGIN]}
                  cols={GRID_COLUMN_COUNT}
                  rowHeight={GRID_CELL_HEIGHT}
                  draggableHandle=".grid-drag-handle"
                  layout={this.buildLayout()}
                  onDragStop={this.onDragStop}
                  onResize={this.onResize}
                  onResizeStop={this.onResizeStop}
                  onLayoutChange={this.onLayoutChange}
                >
                  {this.renderPanels(width)}
                </ReactGridLayout>
              </div>
            );
          }}
        </AutoSizer>
      </div>
    );
  }
}

interface GrafanaGridItemProps extends Record<string, any> {
  gridWidth?: number;
  gridPos?: GridPos;
  isViewing: string;
  windowHeight: number;
  windowWidth: number;
  children: any;
  observer: IntersectionObserver;
}

/**
 * A hacky way to intercept the react-layout-grid item dimensions and pass them to DashboardPanel
 */
const GrafanaGridItem = React.forwardRef<HTMLDivElement, GrafanaGridItemProps>((props, ref) => {
  const theme = config.theme2;
  let width = 100;
  let height = 100;

  const { observer, gridWidth, gridPos, isViewing, windowHeight, windowWidth, ...divProps } = props;
  const style: CSSProperties = props.style ?? {};
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (innerRef.current) {
      observer.observe(innerRef.current);
    }
    return () => {
      if (innerRef.current) {
        observer.unobserve(innerRef.current);
      }
    };
  }, [innerRef, observer]);

  if (isViewing) {
    width = gridWidth!;
    height = windowHeight * 0.85;
    style.height = height;
    style.width = '100%';
  } else if (windowWidth < theme.breakpoints.values.md) {
    width = props.gridWidth!;
    height = props.gridPos!.h * (GRID_CELL_HEIGHT + GRID_CELL_VMARGIN) - GRID_CELL_VMARGIN;
    style.height = height;
    style.width = '100%';
  } else {
    // RGL passes width and height directly to children as style props.
    width = parseFloat(props.style.width);
    height = parseFloat(props.style.height);
  }

  // props.children[0] is our main children. RGL adds the drag handle at props.children[1]
  return (
    <div {...divProps} ref={innerRef}>
      {/* Pass width and height to children as render props */}
      {[props.children[0](width, height), props.children.slice(1)]}
    </div>
  );
});

GrafanaGridItem.displayName = 'GridItemWithDimensions';
