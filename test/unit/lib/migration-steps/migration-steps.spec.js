'use strict';

const { expect } = require('chai');
const Bluebird = require('bluebird');

const migration = require('../../../../lib/migration-steps');
const stripCallsite = require('../../../helpers/strip-callsite');
const stripCallsites = (steps) => steps.map(stripCallsite);

describe('migration-steps', function () {
  describe('when executing a migration', function () {
    it('makes a plan', Bluebird.coroutine(function * () {
      const plan = yield migration(function up (migration) {
        const person = migration.createContentType('person', {
          description: 'A content type for a person'
        });

        person.createField('fullName', {
          name: 'Full Name',
          type: 'Symbol'
        });

        person.name('a person');

        const address = migration.editContentType('address', {
          name: 'the new name'
        });

        address.editField('houseNumber').omitted(true);
        address.createField('houseExtension', {
          type: 'Symbol'
        });
      });

      expect(stripCallsites(plan)).to.eql([
        {
          'type': 'contentType/create',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/0'
          },
          'payload': {
            'contentTypeId': 'person'
          }
        },
        {
          'type': 'contentType/update',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/0'
          },
          'payload': {
            'contentTypeId': 'person',
            'props': {
              'description': 'A content type for a person'
            }
          }
        },
        {
          'type': 'field/create',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/0',
            'fieldInstanceId': 'fields/fullName/0'
          },
          'payload': {
            'contentTypeId': 'person',
            'fieldId': 'fullName'
          }
        },
        {
          'type': 'field/update',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/0',
            'fieldInstanceId': 'fields/fullName/0'
          },
          'payload': {
            'contentTypeId': 'person',
            'fieldId': 'fullName',
            'props': {
              'name': 'Full Name'
            }
          }
        },
        {
          'type': 'field/update',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/0',
            'fieldInstanceId': 'fields/fullName/0'
          },
          'payload': {
            'contentTypeId': 'person',
            'fieldId': 'fullName',
            'props': {
              'type': 'Symbol'
            }
          }
        },
        {
          'type': 'contentType/update',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/0'
          },
          'payload': {
            'contentTypeId': 'person',
            'props': {
              'name': 'a person'
            }
          }
        },
        {
          'type': 'contentType/update',
          'meta': {
            'contentTypeInstanceId': 'contentType/address/0'
          },
          'payload': {
            'contentTypeId': 'address',
            'props': {
              'name': 'the new name'
            }
          }
        },
        {
          'type': 'field/update',
          'meta': {
            'contentTypeInstanceId': 'contentType/address/0',
            'fieldInstanceId': 'fields/houseNumber/0'
          },
          'payload': {
            'contentTypeId': 'address',
            'fieldId': 'houseNumber',
            'props': {
              'omitted': true
            }
          }
        },
        {
          'type': 'field/create',
          'meta': {
            'contentTypeInstanceId': 'contentType/address/0',
            'fieldInstanceId': 'fields/houseExtension/0'
          },
          'payload': {
            'contentTypeId': 'address',
            'fieldId': 'houseExtension'
          }
        },
        {
          'type': 'field/update',
          'meta': {
            'contentTypeInstanceId': 'contentType/address/0',
            'fieldInstanceId': 'fields/houseExtension/0'
          },
          'payload': {
            'contentTypeId': 'address',
            'fieldId': 'houseExtension',
            'props': {
              'type': 'Symbol'
            }
          }
        }
      ]);
    }));
  });

  describe('when calling methods for props that do not exist', function () {
    it('creates the steps anyway', Bluebird.coroutine(function * () {
      const plan = yield migration(function up (migration) {
        const person = migration.createContentType('person', {
          foo: 'This is an invalid prop'
        });

        person.createField('fullName', {
          bar: 'Full Name',
          type: 'Symbol'
        });

        person.fussel('a person');
      });

      expect(stripCallsites(plan)).to.eql([
        {
          'type': 'contentType/create',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/0'
          },
          'payload': {
            'contentTypeId': 'person'
          }
        },
        {
          'type': 'contentType/update',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/0'
          },
          'payload': {
            'contentTypeId': 'person',
            'props': {
              'foo': 'This is an invalid prop'
            }
          }
        },
        {
          'type': 'field/create',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/0',
            'fieldInstanceId': 'fields/fullName/0'
          },
          'payload': {
            'contentTypeId': 'person',
            'fieldId': 'fullName'
          }
        },
        {
          'type': 'field/update',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/0',
            'fieldInstanceId': 'fields/fullName/0'
          },
          'payload': {
            'contentTypeId': 'person',
            'fieldId': 'fullName',
            'props': {
              'bar': 'Full Name'
            }
          }
        },
        {
          'type': 'field/update',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/0',
            'fieldInstanceId': 'fields/fullName/0'
          },
          'payload': {
            'contentTypeId': 'person',
            'fieldId': 'fullName',
            'props': {
              'type': 'Symbol'
            }
          }
        },
        {
          'type': 'contentType/update',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/0'
          },
          'payload': {
            'contentTypeId': 'person',
            'props': {
              'fussel': 'a person'
            }
          }
        }
      ]);
    }));
  });

  describe('when dealing with multiple instances', function () {
    it('makes a plan', Bluebird.coroutine(function * () {
      const plan = yield migration(function up (migration) {
        const person1 = migration.editContentType('person', {
          description: 'A content type for a person'
        });

        const person2 = migration.createContentType('person', {
          description: 'A content type for a person'
        });

        person2.createField('fullName', {
          name: 'Full Name',
          type: 'Symbol'
        });

        person1.createField('fullName', {
          name: 'Full Name',
          type: 'Symbol'
        });
      });

      expect(stripCallsites(plan)).to.eql([
        {
          'type': 'contentType/update',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/0'
          },
          'payload': {
            'contentTypeId': 'person',
            'props': {
              'description': 'A content type for a person'
            }
          }
        },
        {
          'type': 'contentType/create',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/1'
          },
          'payload': {
            'contentTypeId': 'person'
          }
        },
        {
          'type': 'contentType/update',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/1'
          },
          'payload': {
            'contentTypeId': 'person',
            'props': {
              'description': 'A content type for a person'
            }
          }
        },
        {
          'type': 'field/create',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/1',
            'fieldInstanceId': 'fields/fullName/0'
          },
          'payload': {
            'contentTypeId': 'person',
            'fieldId': 'fullName'
          }
        },
        {
          'type': 'field/update',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/1',
            'fieldInstanceId': 'fields/fullName/0'
          },
          'payload': {
            'contentTypeId': 'person',
            'fieldId': 'fullName',
            'props': {
              'name': 'Full Name'
            }
          }
        },
        {
          'type': 'field/update',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/1',
            'fieldInstanceId': 'fields/fullName/0'
          },
          'payload': {
            'contentTypeId': 'person',
            'fieldId': 'fullName',
            'props': {
              'type': 'Symbol'
            }
          }
        },
        {
          'type': 'field/create',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/0',
            'fieldInstanceId': 'fields/fullName/0'
          },
          'payload': {
            'contentTypeId': 'person',
            'fieldId': 'fullName'
          }
        },
        {
          'type': 'field/update',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/0',
            'fieldInstanceId': 'fields/fullName/0'
          },
          'payload': {
            'contentTypeId': 'person',
            'fieldId': 'fullName',
            'props': {
              'name': 'Full Name'
            }
          }
        },
        {
          'type': 'field/update',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/0',
            'fieldInstanceId': 'fields/fullName/0'
          },
          'payload': {
            'contentTypeId': 'person',
            'fieldId': 'fullName',
            'props': {
              'type': 'Symbol'
            }
          }
        }
      ]);
    }));
  });

  describe('when defining the display field', function () {
    it('sets the display field', Bluebird.coroutine(function * () {
      const plan = yield migration(function up (migration) {
        const person = migration.createContentType('person', {
          description: 'A content type for a person',
          displayField: 'favorite'
        });
        person.createField('favorite', {
          name: 'favorite color',
          type: 'Symbol'
        });
      });

      expect(stripCallsites(plan)).to.eql([
        {
          'type': 'contentType/create',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/0'
          },
          'payload': {
            'contentTypeId': 'person'
          }
        },
        {
          'type': 'contentType/update',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/0'
          },
          'payload': {
            'contentTypeId': 'person',
            'props': {
              'description': 'A content type for a person'
            }
          }
        },
        {
          'type': 'contentType/update',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/0'
          },
          'payload': {
            'contentTypeId': 'person',
            'props': {
              'displayField': 'favorite'
            }
          }
        },
        {
          'type': 'field/create',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/0',
            'fieldInstanceId': 'fields/favorite/0'
          },
          'payload': {
            'contentTypeId': 'person',
            'fieldId': 'favorite'
          }
        },
        {
          'type': 'field/update',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/0',
            'fieldInstanceId': 'fields/favorite/0'
          },
          'payload': {
            'contentTypeId': 'person',
            'fieldId': 'favorite',
            'props': {
              'name': 'favorite color'
            }
          }
        },
        {
          'type': 'field/update',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/0',
            'fieldInstanceId': 'fields/favorite/0'
          },
          'payload': {
            'contentTypeId': 'person',
            'fieldId': 'favorite',
            'props': {
              'type': 'Symbol'
            }
          }
        }
      ]);
    }));

    it('sets the display field also when chaining', Bluebird.coroutine(function * () {
      const plan = yield migration(function up (migration) {
        const person = migration.createContentType('person', {
          description: 'A content type for a person'
        });
        person.createField('favorite', {
          name: 'favorite color',
          type: 'Symbol'
        });
        person.displayField('favorite');
      });

      expect(stripCallsites(plan)).to.eql([
        {
          'type': 'contentType/create',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/0'
          },
          'payload': {
            'contentTypeId': 'person'
          }
        },
        {
          'type': 'contentType/update',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/0'
          },
          'payload': {
            'contentTypeId': 'person',
            'props': {
              'description': 'A content type for a person'
            }
          }
        },
        {
          'type': 'field/create',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/0',
            'fieldInstanceId': 'fields/favorite/0'
          },
          'payload': {
            'contentTypeId': 'person',
            'fieldId': 'favorite'
          }
        },
        {
          'type': 'field/update',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/0',
            'fieldInstanceId': 'fields/favorite/0'
          },
          'payload': {
            'contentTypeId': 'person',
            'fieldId': 'favorite',
            'props': {
              'name': 'favorite color'
            }
          }
        },
        {
          'type': 'field/update',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/0',
            'fieldInstanceId': 'fields/favorite/0'
          },
          'payload': {
            'contentTypeId': 'person',
            'fieldId': 'favorite',
            'props': {
              'type': 'Symbol'
            }
          }
        },
        {
          'type': 'contentType/update',
          'meta': {
            'contentTypeInstanceId': 'contentType/person/0'
          },
          'payload': {
            'contentTypeId': 'person',
            'props': {
              'displayField': 'favorite'
            }
          }
        }
      ]);
    }));
  });
  describe('when deleting a field', function () {
    it('a delete step is included in the plan', Bluebird.coroutine(function * () {
      const plan = yield migration(function up (migration) {
        migration.editContentType('person').deleteField('age');
      });

      expect(stripCallsites(plan)).to.eql([
        {
          type: 'field/delete',
          meta: {
            contentTypeInstanceId: 'contentType/person/0',
            fieldInstanceId: 'fields/age/0'
          },
          payload: {
            contentTypeId: 'person',
            fieldId: 'age'
          }
        }
      ]);
    }));
  });
});