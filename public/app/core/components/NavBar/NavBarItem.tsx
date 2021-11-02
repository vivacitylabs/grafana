import React, { useState, ReactNode } from 'react';
import { css, cx } from '@emotion/css';
import { GrafanaTheme2, NavModelItem } from '@grafana/data';
import { Link, useTheme2 } from '@grafana/ui';
import NavBarDropdown from './NavBarDropdown';
import { useFocusWithin } from '@react-aria/interactions';

export interface Props {
  isActive?: boolean;
  children: ReactNode;
  label: string;
  menuItems?: NavModelItem[];
  menuSubTitle?: string;
  onClick?: () => void;
  reverseMenuDirection?: boolean;
  target?: HTMLAnchorElement['target'];
  url?: string;
}

const NavBarItem = ({
  isActive = false,
  children,
  label,
  menuItems = [],
  menuSubTitle,
  onClick,
  reverseMenuDirection = false,
  target,
  url,
}: Props) => {
  const theme = useTheme2();
  const styles = getStyles(theme, isActive);
  let element = (
    <button className={styles.element} onClick={onClick} aria-label={label}>
      <span className={styles.icon}>{children}</span>
    </button>
  );

  //a11y
  const [open, setOpen] = useState(false);

  let { focusWithinProps } = useFocusWithin({
    onFocusWithin: (e) => {
      console.log('focus');
    },
    onBlurWithin: (e) => {
      console.log('blur');
    },
    onFocusWithinChange: (isFocused) => {
      setOpen(isFocused);
      console.log(`focus change: ${isFocused}`);
    },
  });

  if (url) {
    element =
      !target && url.startsWith('/') ? (
        <Link className={styles.element} href={url} target={target} aria-label={label} onClick={onClick}>
          <span className={styles.icon}>{children}</span>
        </Link>
      ) : (
        <a href={url} target={target} className={styles.element} onClick={onClick} aria-label={label}>
          <span className={styles.icon}>{children}</span>
        </a>
      );
  }

  return (
    <li
      {...focusWithinProps}
      aria-haspopup={menuItems?.length > 0 ? 'true' : false}
      className={cx(styles.container, 'dropdown', { dropup: reverseMenuDirection, focused: open })}
    >
      {element}
      {open && (
        <NavBarDropdown
          headerTarget={target}
          headerText={label}
          headerUrl={url}
          items={menuItems}
          onHeaderClick={onClick}
          reverseDirection={reverseMenuDirection}
          subtitleText={menuSubTitle}
        />
      )}
    </li>
  );
};

export default NavBarItem;

const getStyles = (theme: GrafanaTheme2, isActive: Props['isActive']) => ({
  container: css`
    position: relative;

    @keyframes dropdown-anim {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }

    ${theme.breakpoints.up('md')} {
      color: ${isActive ? theme.colors.text.primary : theme.colors.text.secondary};

      &:hover {
        background-color: ${theme.colors.action.hover};
        color: ${theme.colors.text.primary};

        .dropdown-menu {
          animation: dropdown-anim 150ms ease-in-out 100ms forwards;
          display: flex;
          // important to overlap it otherwise it can be hidden
          // again by the mouse getting outside the hover space
          left: ${theme.components.sidemenu.width - 1}px;
          margin: 0;
          opacity: 0;
          top: 0;
          z-index: ${theme.zIndex.sidemenu};
        }

        &.dropup .dropdown-menu {
          top: auto;
        }
      }

      &.focused {
        .dropdown-menu {
          animation: dropdown-anim 150ms ease-in-out 100ms forwards;
          display: flex;
          // important to overlap it otherwise it can be hidden
          // again by the mouse getting outside the hover space
          left: ${theme.components.sidemenu.width - 1}px;
          margin: 0;
          opacity: 0;
          top: 0;
          z-index: ${theme.zIndex.sidemenu};
        }
      }
    }
  `,
  element: css`
    background-color: transparent;
    border: none;
    color: inherit;
    display: block;
    line-height: ${theme.components.sidemenu.width}px;
    padding: 0;
    text-align: center;
    width: ${theme.components.sidemenu.width}px;

    &::before {
      display: ${isActive ? 'block' : 'none'};
      content: ' ';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      border-radius: 2px;
      background-image: ${theme.colors.gradients.brandVertical};
    }

    &:focus-visible {
      background-color: ${theme.colors.action.hover};
      box-shadow: none;
      color: ${theme.colors.text.primary};
      outline: 2px solid ${theme.colors.primary.main};
      outline-offset: -2px;
      transition: none;
    }

    .sidemenu-open--xs & {
      display: none;
    }
  `,
  icon: css`
    height: 100%;
    width: 100%;

    img {
      border-radius: 50%;
      height: 24px;
      width: 24px;
    }
  `,
});
