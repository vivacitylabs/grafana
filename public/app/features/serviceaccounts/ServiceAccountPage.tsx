import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { getNavModel } from 'app/core/selectors/navModel';
import Page from 'app/core/components/Page/Page';
import { ServiceAccountProfile } from './ServiceAccountProfile';
import { StoreState, ServiceAccountDTO, ApiKey, Role } from 'app/types';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import {
  deleteServiceAccountToken,
  loadServiceAccount,
  loadServiceAccountTokens,
  createServiceAccountToken,
  fetchACOptions,
  updateServiceAccount,
  deleteServiceAccount,
} from './state/actions';
import { ServiceAccountTokensTable } from './ServiceAccountTokensTable';
import { getTimeZone, NavModel } from '@grafana/data';
import { Button, VerticalGroup } from '@grafana/ui';
import { CreateTokenModal } from './CreateTokenModal';
import { contextSrv } from 'app/core/core';

interface OwnProps extends GrafanaRouteComponentProps<{ id: string }> {
  navModel: NavModel;
  serviceAccount?: ServiceAccountDTO;
  tokens: ApiKey[];
  isLoading: boolean;
  roleOptions: Role[];
  builtInRoles: Record<string, Role[]>;
}

function mapStateToProps(state: StoreState) {
  return {
    navModel: getNavModel(state.navIndex, 'serviceaccounts'),
    serviceAccount: state.serviceAccountProfile.serviceAccount,
    tokens: state.serviceAccountProfile.tokens,
    isLoading: state.serviceAccountProfile.isLoading,
    roleOptions: state.serviceAccounts.roleOptions,
    builtInRoles: state.serviceAccounts.builtInRoles,
    timezone: getTimeZone(state.user),
  };
}
const mapDispatchToProps = {
  loadServiceAccount,
  loadServiceAccountTokens,
  createServiceAccountToken,
  deleteServiceAccountToken,
  deleteServiceAccount,
  updateServiceAccount,
  fetchACOptions,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = OwnProps & ConnectedProps<typeof connector>;

const ServiceAccountPageUnconnected = ({
  navModel,
  match,
  serviceAccount,
  tokens,
  timezone,
  isLoading,
  roleOptions,
  builtInRoles,
  loadServiceAccount,
  loadServiceAccountTokens,
  createServiceAccountToken,
  deleteServiceAccountToken,
  deleteServiceAccount,
  updateServiceAccount,
  fetchACOptions,
}: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newToken, setNewToken] = useState('');

  useEffect(() => {
    const serviceAccountId = parseInt(match.params.id, 10);
    loadServiceAccount(serviceAccountId);
    loadServiceAccountTokens(serviceAccountId);
    if (contextSrv.accessControlEnabled()) {
      fetchACOptions();
    }
  }, [match, loadServiceAccount, loadServiceAccountTokens, fetchACOptions]);

  const onDeleteServiceAccountToken = (key: ApiKey) => {
    deleteServiceAccountToken(parseInt(match.params.id, 10), key.id!);
  };

  const onCreateToken = (token: ApiKey) => {
    createServiceAccountToken(serviceAccount.id, token, setNewToken);
  };

  const onModalClose = () => {
    setIsModalOpen(false);
    setNewToken('');
  };

  return (
    <Page navModel={navModel}>
      <Page.Contents isLoading={isLoading}>
        {serviceAccount && (
          <>
            <ServiceAccountProfile
              serviceAccount={serviceAccount}
              timeZone={timezone}
              roleOptions={roleOptions}
              builtInRoles={builtInRoles}
              updateServiceAccount={updateServiceAccount}
              deleteServiceAccount={deleteServiceAccount}
            />
          </>
        )}
        <VerticalGroup spacing="md">
          <Button onClick={() => setIsModalOpen(true)}>Add token</Button>
          <h3 className="page-heading">Tokens</h3>
          {tokens && (
            <ServiceAccountTokensTable tokens={tokens} timeZone={timezone} onDelete={onDeleteServiceAccountToken} />
          )}
        </VerticalGroup>
        <CreateTokenModal isOpen={isModalOpen} token={newToken} onCreateToken={onCreateToken} onClose={onModalClose} />
      </Page.Contents>
    </Page>
  );
};

export const ServiceAccountPage = connector(ServiceAccountPageUnconnected);
