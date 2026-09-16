"use client";

import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

const DASHBOARD_DESIGN_WIDTH = 1890;

export function EnhancedDashboardCanvas({ children }:{ children:ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({ scale:0, height:0 });

  useLayoutEffect(() => {
    let frame = 0;
    const update = () => {
      const stage = stageRef.current;
      const canvas = canvasRef.current;
      if (!stage || !canvas) return;
      const scale = Math.min(1, stage.clientWidth / DASHBOARD_DESIGN_WIDTH);
      const height = Math.ceil(canvas.offsetHeight * scale);
      setLayout((current) => Math.abs(current.scale - scale) < .001 && current.height === height ? current : { scale, height });
    };
    const schedule = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    if (stageRef.current) observer.observe(stageRef.current);
    if (canvasRef.current) observer.observe(canvasRef.current);
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return <div className="dashboard-stage" ref={stageRef} style={{ height:layout.height || 1 }}>
    <div className="dashboard-canvas" ref={canvasRef} style={{ transform:`scale(${layout.scale || 1})`, visibility:layout.scale ? "visible" : "hidden" }}>
      {children}
    </div>
  </div>;
}
