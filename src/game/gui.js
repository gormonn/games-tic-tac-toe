import styled from "styled-components";
import { animated } from "@react-spring/web";

export const Overlay = styled.div`
  background: ${(p) => (p.$winner ? "rgba(30, 30, 30, 0.5)" : "none")};
  z-index: ${(p) => (p.$winner ? "1" : "0")};
  transition: 200ms;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;
export const Rows = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
export const Box = styled.div`
  max-width: 100%;
  max-height: 100%;
  min-width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`;
const ColumnBackground = (p) => (p.$touched ? "darkgray" : "gray");
export const Column = styled(animated.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 500ms;
  width: 100px;
  height: 100px;
  position: relative;
  box-sizing: border-box;
  border: ${(p) => (p.$isWinLine ? "4px solid black " : "none ")};
  zoom: ${(p) => (p.$winner ? "1!important;" : "")};
  background: ${ColumnBackground};
  pointer-events: ${(p) => (p.$touched ? "none" : "auto")};
  cursor: ${(p) => (p.$touched ? "none" : "pointer")};
  &:hover {
    background: ${(p) =>
      p.$touched ? ColumnBackground(p) : "rgba(255,255,255,.5)"};
  }

  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;
export const ColumnName = styled.span`
  color: gray;
  position: absolute;
  bottom: 14px;
  right: 14px;
  font-size: 14px;
`;
