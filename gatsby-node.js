function pathObjectToPathString(input) {
  const path = [];
  let currentValue = input;
  let leaf = undefined;
  while (currentValue) {
    if (typeof currentValue === `object`) {
      const entries = Object.entries(currentValue);
      if (entries.length !== 1) {
        throw new Error(`Invalid field arg`);
      }
      for (const [key, value] of entries) {
        path.push(key);
        currentValue = value;
      }
    } else {
      leaf = currentValue;
      currentValue = undefined;
    }
  }

  return {
    path: path.join(`.`),
    leaf,
  };
}

function maybeConvertSortInputObjectToSortPath(args) {
  if (!args.sort) {
    return args;
  }

  let sorts = args.sort;
  if (!Array.isArray(sorts)) {
    sorts = [sorts];
  }

  const modifiedSort = {
    fields: [],
    order: [],
  };

  for (const sort of sorts) {
    const { path, leaf } = pathObjectToPathString(sort);
    modifiedSort.fields.push(path);
    modifiedSort.order.push(leaf);
  }

  return {
    ...args,
    sort: modifiedSort,
  };
}

exports.createSchemaCustomization = ({ actions, schema }) => {
  actions.createTypes(
    schema.buildObjectType({
      name: `Test`,
      interfaces: [`Node`],
      fields: {
        child_items: {
          type: `[Test]`,
          args: {
            limit: "Int",
            sort: `TestSortInput`,
          },
          resolve: async (source, args, context) => {
            const { sort } = maybeConvertSortInputObjectToSortPath(args);

            const { entries } = await context.nodeModel.findAll({
              query: {
                filter: {
                  parentNodeId: {
                    eq: source.id,
                  },
                },
                limit: args.limit,
                sort: sort,
              },
              type: `Test`,
            });
            return entries;
          },
        },
      },
    })
  );
};

exports.sourceNodes = ({ actions }) => {
  actions.createNode({
    id: `1`,
    parentNodeId: undefined,
    label: "Top #1",
    sort1: 0,
    sort2: 9,
    internal: {
      type: `Test`,
      contentDigest: `0`,
    },
  });

  actions.createNode({
    id: `1-1`,
    parentNodeId: `1`,
    label: "Child #1->#1",
    sort1: 1,
    sort2: 8,
    internal: {
      type: `Test`,
      contentDigest: `0`,
    },
  });

  actions.createNode({
    id: `1-2`,
    parentNodeId: `1`,
    label: "Child #1->#2",
    sort1: 2,
    sort2: 7,
    internal: {
      type: `Test`,
      contentDigest: `0`,
    },
  });
};
