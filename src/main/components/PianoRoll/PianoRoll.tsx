import styled from "@emotion/styled"
import useComponentSize from "@rehooks/component-size"
import { clamp } from "lodash"
import { observer } from "mobx-react-lite"
import { FC, useCallback, useRef } from "react"
import { Layout, WHEEL_SCROLL_RATE } from "../../Constants"
import { isTouchPadEvent } from "../../helpers/touchpad"
import { useStores } from "../../hooks/useStores"
import ControlPane from "../ControlPane/ControlPane"
import {
  HorizontalScaleScrollBar,
  VerticalScaleScrollBar,
} from "../inputs/ScaleScrollBar"
import { PianoRollStage } from "./PianoRollStage"
import { StyledSplitPane } from "./StyledSplitPane"

const Parent = styled.div`
  flex-grow: 1;
  background: ${({ theme }) => theme.backgroundColor};
  position: relative;
`

const Alpha = styled.div`
  flex-grow: 1;
  position: relative;

  .alphaContent {
    position: absolute;
    top: 0;
    left: 0;
  }
`

const Beta = styled.div`
  border-top: 1px solid ${({ theme }) => theme.dividerColor};
  height: calc(100% - 17px);
`

const PianoRollWrapper: FC = observer(() => {
  const rootStore = useStores()

  const s = rootStore.pianoRollStore
  const {
    scaleX,
    scaleY,
    scrollLeft,
    scrollTop,
    transform,
    contentWidth,
    contentHeight,
  } = rootStore.pianoRollStore

  const ref = useRef(null)
  const size = useComponentSize(ref)

  const alphaRef = useRef(null)
  const { height: alphaHeight = 0 } = useComponentSize(alphaRef)

  const onClickScaleUpHorizontal = useCallback(
    () => s.scaleAroundPointX(0.2, Layout.keyWidth),
    [scaleX, s]
  )
  const onClickScaleDownHorizontal = useCallback(
    () => s.scaleAroundPointX(-0.2, Layout.keyWidth),
    [scaleX, s]
  )
  const onClickScaleResetHorizontal = useCallback(() => (s.scaleX = 1), [s])

  const onClickScaleUpVertical = useCallback(
    () => s.scaleAroundPointY(0.2, 0),
    [scaleY, s]
  )
  const onClickScaleDownVertical = useCallback(
    () => s.scaleAroundPointY(-0.2, 0),
    [scaleY, s]
  )
  const onClickScaleResetVertical = useCallback(() => (s.scaleY = 1), [s])

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.shiftKey && (e.altKey || e.ctrlKey)) {
        // vertical zoom
        let scaleYDelta = isTouchPadEvent(e.nativeEvent)
          ? 0.02 * e.deltaY
          : 0.01 * e.deltaX
        scaleYDelta = clamp(scaleYDelta, -0.15, 0.15) // prevent acceleration to zoom too fast
        s.scaleAroundPointY(scaleYDelta, e.nativeEvent.offsetY)
      } else if (e.altKey || e.ctrlKey) {
        // horizontal zoom
        const scaleFactor = isTouchPadEvent(e.nativeEvent) ? 0.01 : -0.01
        const scaleXDelta = clamp(e.deltaY * scaleFactor, -0.15, 0.15) // prevent acceleration to zoom too fast
        s.scaleAroundPointX(scaleXDelta, e.nativeEvent.offsetX)
      } else if (isTouchPadEvent(e.nativeEvent)) {
        // touch pad scrolling
        s.scrollBy(-e.deltaX, -e.deltaY)
      } else {
        // scrolling
        const scaleFactor = transform.pixelsPerKey * WHEEL_SCROLL_RATE
        // treat horizontal and vertical scroll as one to standardize the platform differences
        // in macOS, shift + scroll is horizontal scroll while in Windows, it is vertical scroll
        const delta = (e.deltaX + e.deltaY) * scaleFactor
        // scroll horizontally if shift key is pressed
        if (e.shiftKey) {
          s.scrollBy(-delta, 0)
        } else {
          s.scrollBy(0, -delta)
        }
      }
    },
    [s, transform]
  )

  return (
    <Parent ref={ref}>
      <StyledSplitPane split="horizontal" minSize={50} defaultSize={"60%"}>
        <Alpha onWheel={onWheel} ref={alphaRef}>
          <PianoRollStage width={size.width} height={alphaHeight} />
          <VerticalScaleScrollBar
            scrollOffset={scrollTop}
            contentLength={contentHeight}
            onScroll={useCallback((v: any) => s.setScrollTopInPixels(v), [s])}
            onClickScaleUp={onClickScaleUpVertical}
            onClickScaleDown={onClickScaleDownVertical}
            onClickScaleReset={onClickScaleResetVertical}
          />
        </Alpha>
        <Beta>
          <ControlPane />
        </Beta>
      </StyledSplitPane>
      <HorizontalScaleScrollBar
        scrollOffset={scrollLeft}
        contentLength={contentWidth}
        onScroll={useCallback((v: any) => s.setScrollLeftInPixels(v), [s])}
        onClickScaleUp={onClickScaleUpHorizontal}
        onClickScaleDown={onClickScaleDownHorizontal}
        onClickScaleReset={onClickScaleResetHorizontal}
      />
    </Parent>
  )
})

export default PianoRollWrapper
