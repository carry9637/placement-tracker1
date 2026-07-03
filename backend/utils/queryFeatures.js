const buildQueryFeatures = async ({
  model,
  query,
  searchableFields = [],
  allowedFilters = [],
  baseFilter = {},
  populate = [],
  defaultSort = "-createdAt",
}) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;
  const filter = {};

  allowedFilters.forEach((field) => {
    if (query[field] !== undefined && query[field] !== "") {
      filter[field] = query[field];
    }
  });

  if (query.search && searchableFields.length > 0) {
    filter.$or = searchableFields.map((field) => ({
      [field]: { $regex: query.search, $options: "i" },
    }));
  }

  Object.assign(filter, baseFilter);

  const sort = query.sort || defaultSort;
  let dbQuery = model.find(filter).sort(sort).skip(skip).limit(limit);

  populate.forEach((item) => {
    dbQuery = dbQuery.populate(item);
  });

  const [items, total] = await Promise.all([dbQuery, model.countDocuments(filter)]);
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      sort,
    },
  };
};

module.exports = buildQueryFeatures;
