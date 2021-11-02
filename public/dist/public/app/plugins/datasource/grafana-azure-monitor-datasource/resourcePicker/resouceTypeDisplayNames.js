export var RESOURCE_TYPE_NAMES = {
    'microsoft.analysisservices/servers': 'Analysis Services',
    'microsoft.synapse/workspaces/bigdatapools': 'Apache Spark pools',
    'microsoft.apimanagement/service': 'API Management services',
    'microsoft.appconfiguration/configurationstores': 'App Configuration',
    'microsoft.web/sites/slots': 'App Service (Slots)',
    'microsoft.web/hostingenvironments': 'App Service Environments',
    'microsoft.web/serverfarms': 'App Service plans',
    'microsoft.web/sites': 'App Services',
    'microsoft.network/applicationgateways': 'Application gateways',
    'microsoft.insights/components': 'Application Insights',
    'microsoft.automation/automationaccounts': 'Automation Accounts',
    'microsoft.insights/autoscalesettings': 'Autoscale Settings',
    'microsoft.aadiam/azureadmetrics': 'Azure AD Metrics',
    'microsoft.cache/redis': 'Azure Cache for Redis',
    'microsoft.documentdb/databaseaccounts': 'Azure Cosmos DB accounts',
    'microsoft.kusto/clusters': 'Azure Data Explorer Clusters',
    'microsoft.dbformariadb/servers': 'Azure Database for MariaDB servers',
    'microsoft.dbformysql/servers': 'Azure Database for MySQL servers',
    'microsoft.dbforpostgresql/flexibleservers': 'Azure Database for PostgreSQL flexible servers',
    'microsoft.dbforpostgresql/servergroupsv2': 'Azure Database for PostgreSQL server groups',
    'microsoft.dbforpostgresql/servers': 'Azure Database for PostgreSQL servers',
    'microsoft.dbforpostgresql/serversv2': 'Azure Database for PostgreSQL servers v2',
    'microsoft.resources/subscriptions': 'Azure Resource Manager',
    'microsoft.appplatform/spring': 'Azure Spring Cloud',
    'microsoft.databoxedge/databoxedgedevices': 'Azure Stack Edge / Data Box Gateway',
    'microsoft.azurestackresourcemonitor/storageaccountmonitor': 'Azure Stack Resource Monitor',
    'microsoft.synapse/workspaces': 'Azure Synapse Analytics',
    'microsoft.network/bastionhosts': 'Bastions',
    'microsoft.batch/batchaccounts': 'Batch accounts',
    'microsoft.botservice/botservices': 'Bot Services',
    'microsoft.netapp/netappaccounts/capacitypools': 'Capacity pools',
    'microsoft.classiccompute/domainnames': 'Cloud services (classic)',
    'microsoft.vmwarecloudsimple/virtualmachines': 'CloudSimple Virtual Machines',
    'microsoft.cognitiveservices/accounts': 'Cognitive Services',
    'microsoft.network/networkwatchers/connectionmonitors': 'Connection Monitors',
    'microsoft.network/connections': 'Connections',
    'microsoft.containerinstance/containergroups': 'Container instances',
    'microsoft.containerregistry/registries': 'Container registries',
    'microsoft.insights/qos': 'Custom Metric Usage',
    'microsoft.customerinsights/hubs': 'CustomerInsights',
    'microsoft.datafactory/datafactories': 'Data factories',
    'microsoft.datafactory/factories': 'Data factories (V2)',
    'microsoft.datalakeanalytics/accounts': 'Data Lake Analytics',
    'microsoft.datalakestore/accounts': 'Data Lake Storage Gen1',
    'microsoft.datashare/accounts': 'Data Shares',
    'microsoft.synapse/workspaces/sqlpools': 'Dedicated SQL pools',
    'microsoft.devices/provisioningservices': 'Device Provisioning Services',
    'microsoft.compute/disks': 'Disks',
    'microsoft.network/dnszones': 'DNS zones',
    'microsoft.eventgrid/domains': 'Event Grid Domains',
    'microsoft.eventgrid/systemtopics': 'Event Grid System Topics',
    'microsoft.eventgrid/topics': 'Event Grid Topics',
    'microsoft.eventhub/clusters': 'Event Hubs Clusters',
    'microsoft.eventhub/namespaces': 'Event Hubs Namespaces',
    'microsoft.network/expressroutecircuits': 'ExpressRoute circuits',
    'microsoft.network/expressrouteports': 'ExpressRoute Direct',
    'microsoft.network/expressroutegateways': 'ExpressRoute Gateways',
    'microsoft.fabric.admin/fabriclocations': 'Fabric Locations',
    'microsoft.network/azurefirewalls': 'Firewalls',
    'microsoft.network/frontdoors': 'Front Doors',
    'microsoft.hdinsight/clusters': 'HDInsight clusters',
    'microsoft.storagecache/caches': 'HPC caches',
    'microsoft.logic/integrationserviceenvironments': 'Integration Service Environments',
    'microsoft.iotcentral/iotapps': 'IoT Central Applications',
    'microsoft.devices/iothubs': 'IoT Hub',
    'microsoft.keyvault/vaults': 'Key vaults',
    'microsoft.kubernetes/connectedclusters': 'Kubernetes - Azure Arc',
    'microsoft.containerservice/managedclusters': 'Kubernetes services',
    'microsoft.media/mediaservices/liveevents': 'Live events',
    'microsoft.network/loadbalancers': 'Load balancers',
    'microsoft.operationalinsights/workspaces': 'Log Analytics workspaces',
    'microsoft.logic/workflows': 'Logic apps',
    'microsoft.machinelearningservices/workspaces': 'Machine learning',
    'microsoft.media/mediaservices': 'Media Services',
    'microsoft.network/natgateways': 'NAT gateways',
    'microsoft.network/networkinterfaces': 'Network interfaces',
    'microsoft.network/networkvirtualappliances': 'Network Virtual Appliances',
    'microsoft.network/networkwatchers': 'Network Watchers',
    'microsoft.notificationhubs/namespaces/notificationhubs': 'Notification Hubs',
    'microsoft.network/p2svpngateways': 'P2S VPN Gateways',
    'microsoft.peering/peeringservices': 'Peering Services',
    'microsoft.powerbidedicated/capacities': 'Power BI Embedded',
    'microsoft.network/privateendpoints': 'Private endpoints',
    'microsoft.network/privatelinkservices': 'Private link services',
    'microsoft.network/publicipaddresses': 'Public IP addresses',
    'microsoft.cache/redisenterprise': 'Redis Enterprise',
    'microsoft.relay/namespaces': 'Relays',
    'microsoft.synapse/workspaces/scopepools': 'Scope pools',
    'microsoft.search/searchservices': 'Search services',
    'microsoft.servicebus/namespaces': 'Service Bus Namespaces',
    'microsoft.signalrservice/signalr': 'SignalR',
    'microsoft.operationsmanagement/solutions': 'Solutions',
    'microsoft.sql/servers/databases': 'SQL databases',
    'microsoft.sql/servers/elasticpools': 'SQL elastic pools',
    'microsoft.sql/managedinstances': 'SQL managed instances',
    'microsoft.storage/storageaccounts': 'Storage accounts',
    'microsoft.classicstorage/storageaccounts': 'Storage accounts (classic)',
    'microsoft.storagesync/storagesyncservices': 'Storage Sync Services',
    'microsoft.streamanalytics/streamingjobs': 'Stream Analytics jobs',
    'microsoft.media/mediaservices/streamingendpoints': 'Streaming Endpoints',
    'microsoft.timeseriesinsights/environments': 'Time Series Insights environments',
    'microsoft.network/trafficmanagerprofiles': 'Traffic Manager profiles',
    'microsoft.compute/virtualmachinescalesets': 'Virtual machine scale sets',
    'microsoft.compute/virtualmachines': 'Virtual machines',
    'microsoft.classiccompute/virtualmachines': 'Virtual machines (classic)',
    'microsoft.network/virtualnetworkgateways': 'Virtual network gateways',
    'microsoft.netapp/netappaccounts/capacitypools/volumes': 'Volumes',
    'microsoft.network/vpngateways': 'VPN Gateways',
    'microsoft.cdn/cdnwebapplicationfirewallpolicies': 'Web application firewall policies (WAF)',
    'microsoft.web/hostingenvironments/workerpools': 'WorkerPools',
};
//# sourceMappingURL=resouceTypeDisplayNames.js.map