import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  active?: boolean;
  className?: string;
  title?: string;
}

export const Icon: React.FC<IconProps & { children: React.ReactNode }> = ({
  size = 18,
  color = "currentColor",
  strokeWidth = 1.75,
  active = false,
  className = "",
  title,
  children,
  viewBox = "0 0 24 24",
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`oms-icon ${active ? "oms-icon--active" : ""} ${className}`}
      aria-hidden={!title}
      role={title ? "img" : "presentation"}
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        flexShrink: 0,
        transition: "stroke var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out)",
        ...props.style,
      }}
      {...props}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
};
