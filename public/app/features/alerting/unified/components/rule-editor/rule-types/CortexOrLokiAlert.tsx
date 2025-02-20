import React, { FC } from 'react';
import { RuleType, SharedProps } from './RuleType';
import { DisabledTooltip } from './DisabledTooltip';
import { RuleFormType } from '../../../types/rule-form';

interface Props extends SharedProps {
  onClick: (value: RuleFormType) => void;
}

const CortexFlavoredType: FC<Props> = ({ selected = false, disabled = false, onClick }) => {
  return (
    <DisabledTooltip visible={disabled}>
      <RuleType
        name="Cortex or Loki alert"
        description={
          <span>
            Use a Cortex or Loki datasource.
            <br />
            Expressions are not supported.
          </span>
        }
        image="/public/img/alerting/cortex_logo.svg"
        selected={selected}
        disabled={disabled}
        value={RuleFormType.cloudAlerting}
        onClick={onClick}
      />
    </DisabledTooltip>
  );
};

export { CortexFlavoredType };
