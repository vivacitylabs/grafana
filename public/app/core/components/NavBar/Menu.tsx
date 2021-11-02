import React, { useRef } from 'react';
import { useTreeState } from '@react-stately/tree';
import { useMenu } from '@react-aria/menu';
import MenuItem from './MenuItem';

function Menu(props) {
  // Create state based on the incoming props
  let state = useTreeState({ ...props, selectionMode: 'none' });

  // Get props for the menu element
  let ref = useRef<HTMLUListElement>(null);
  let { menuProps } = useMenu(props, state, ref);

  return (
    <ul
      {...menuProps}
      ref={ref}
      style={{
        padding: 0,
        listStyle: 'none',
      }}
    >
      {[...state.collection].map((item) => (
        <MenuItem key={item.key} item={item} state={state} onAction={props.onAction} />
      ))}
    </ul>
  );
}

export default Menu;
