export default {
  address: '',
  addressComponents: {
    number: '',
    street: '',
    city: '',
    state: '',
    postCode: '',
    admin: ''
  },
  footprint: false,
  distanceFromFootprint: 0,
  buildingType: '',
  owner: {
    name: '',
    address: '',
    phone: '',
    email: '',
    contactPerson: ''
  },
  management: {
    name: '',
    address: '',
    phone: '',
    email: '',
    contactPerson: ''
  },
  customerInstallApprovalRequired: false,
  inductionRequired: false,
  difficultyLevel: {
    leadInInstallation: 3,
    backboneInstallation: 5,
    customerInstallation: 4
  },
  infrastructure: {
    type: 'Active',
    leadIn: {
      planned: false,
      installed: false
    },
    backbone: {
      planned: false,
      installed: false
    },
    customerAccessCabling: {
      planned: false,
      installed: false
    },
    GPOinMDF: {
      exist: false,
      planned: false,
      installed: false
    },
    UPSinMDF: {
      planned: false,
      installed: false
    },
    GPOinRisers: {
      exist: false,
      planned: false,
      installed: false
    },
    UPSinRisers: {
      planned: false,
      installed: false
    }
  },
  numberOfLevels: 0,
  numberOfDwellings: 0,
  avgFloorHeight: 0,
  levels: [
    {
      name: '1',
      planned: {
        router: false,
        splicingBox: false,
        splitter: false,
        oftu: false
      },
      installed: {
        router: false,
        splicingBox: false,
        splitter: false,
        oftu: false
      }
    }
  ]
}
