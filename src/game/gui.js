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
export const Column = styled(animated.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 500ms;
  background: ${(p) => (p.$touched ? "darkgray" : "gray")};
  width: 100px;
  height: 100px;
  position: relative;
  pointer-events: ${(p) => (p.$touched ? "none" : "auto")};
  cursor: ${(p) => (p.$touched ? "none" : "pointer")};
  &:hover {
    background: ${(p) => (p.$touched ? "none" : "rgba(255,255,255,.5)")};
  }
  border: ${(p) => (p.$isWinLine ? "4px solid black " : "none ")};
  box-sizing: border-box;
  zoom: ${(p) => (p.$winner ? "1!important;" : "")};
`;
export const ColumnName = styled.span`
  color: gray;
  position: absolute;
  bottom: 14px;
  right: 14px;
  font-size: 14px;
`;
