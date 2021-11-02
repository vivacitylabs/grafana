import React from 'react';
import { useMenuTriggerState, useTreeState } from 'react-stately';
import {
  DismissButton,
  FocusScope,
  mergeProps,
  useButton,
  useFocus,
  useMenu,
  useMenuItem,
  useMenuTrigger,
  useOverlay,
} from 'react-aria';
import { Icon, IconName, Link, useTheme2 } from '@grafana/ui';

export function MenuButton(props: any) {
  const { link, ...rest } = props;
  // Create state based on the incoming props
  let state = useMenuTriggerState(rest);

  // Get props for the menu trigger and menu elements
  let ref = React.useRef(null);
  let { menuTriggerProps, menuProps } = useMenuTrigger({}, state, ref);

  // Get props for the button based on the trigger props from useMenuTrigger
  let { buttonProps } = useButton(menuTriggerProps, ref);

  let element = (
    <button {...buttonProps} ref={ref} onClick={link.onClick} aria-label={link.label}>
      <span>
        {link.icon && <Icon name={link.icon as IconName} size="xl" />}
        {link.img && <img src={link.img} alt={`${link.text} logo`} />}
      </span>
    </button>
  );

  if (link.url) {
    element =
      !link.target && link.url.startsWith('/') ? (
        <Link {...buttonProps} ref={ref} href={link.url} target={link.target} onClick={link.onClick}>
          <span>
            {link.icon && <Icon name={link.icon as IconName} size="xl" />}
            {link.img && <img src={link.img} alt={`${link.text} logo`} />}
          </span>
        </Link>
      ) : (
        <a href={link.url} target={link.target} onClick={link.onClick} {...buttonProps} ref={ref}>
          <span>
            {link.icon && <Icon name={link.icon as IconName} size="xl" />}
            {link.img && <img src={link.img} alt={`${link.text} logo`} />}
          </span>
        </a>
      );
  }

  return (
    <li style={{ position: 'relative', display: 'inline-block' }}>
      {element}
      {state.isOpen && (
        <MenuPopup {...rest} domProps={menuProps} autoFocus={state.focusStrategy} onClose={() => state.close()} />
      )}
    </li>
  );
}

function MenuPopup(props: any) {
  // Create menu state based on the incoming props
  let state = useTreeState({ ...props, selectionMode: 'none' });

  // Get props for the menu element
  let ref = React.useRef(null);
  let { menuProps } = useMenu(props, state, ref);

  // Handle events that should cause the menu to close,
  // e.g. blur, clicking outside, or pressing the escape key.
  let overlayRef = React.useRef(null);
  let { overlayProps } = useOverlay(
    {
      onClose: props.onClose,
      shouldCloseOnBlur: true,
      isOpen: true,
      isDismissable: true,
    },
    overlayRef
  );

  const theme = useTheme2();
  // Wrap in <FocusScope> so that focus is restored back to the
  // trigger when the menu is closed. In addition, add hidden
  // <DismissButton> components at the start and end of the list
  // to allow screen reader users to dismiss the popup easily.
  return (
    <FocusScope restoreFocus>
      <div {...overlayProps} ref={overlayRef}>
        <DismissButton onDismiss={props.onClose} />
        <ul
          {...mergeProps(menuProps, props.domProps)}
          ref={ref}
          style={{
            backgroundColor: `${theme.colors.action.hover}`,
            color: `${theme.colors.text.primary}`,
            position: 'absolute',
            margin: '4px 0 0 0',
            padding: 0,
            listStyle: 'none',
            background: 'lightgray',
            left: `${theme.components.sidemenu.width - 1}px`,
          }}
        >
          {[...state.collection].map((item) => (
            <MenuItem key={item.key} item={item} state={state} onAction={props.onAction} onClose={props.onClose} />
          ))}
        </ul>
        <DismissButton onDismiss={props.onClose} />
      </div>
    </FocusScope>
  );
}

function MenuItem({ item, state, onAction, onClose }: any) {
  // Get props for the menu item element
  let ref = React.useRef(null);
  let { menuItemProps } = useMenuItem(
    {
      key: item.key,
      isDisabled: item.isDisabled,
      onAction,
      onClose,
    },
    state,
    ref
  );

  // Handle focus events so we can apply highlighted
  // style to the focused menu item
  let [isFocused, setFocused] = React.useState(false);
  let { focusProps } = useFocus({ onFocusChange: setFocused });

  return (
    <li
      {...mergeProps(menuItemProps, focusProps)}
      ref={ref}
      style={{
        background: isFocused ? 'gray' : 'transparent',
        color: isFocused ? 'white' : 'black',
        padding: '2px 5px',
        outline: 'none',
        cursor: 'pointer',
      }}
    >
      {item.rendered}
    </li>
  );
}
