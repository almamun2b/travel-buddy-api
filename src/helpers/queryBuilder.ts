import { Prisma } from "@prisma/client";
import { paginationHelper } from "./paginationHelper";

type IQueryOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
};

type IQueryResult<T> = {
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: T[];
};

class QueryBuilder<T extends Record<string, any>> {
  private model: {
    findMany: (args: any) => Promise<T[]>;
    count: (args: any) => Promise<number>;
  };
  private query: Record<string, any>;
  private whereConditions: any = {};
  private orderBy: Record<string, "asc" | "desc"> = {};
  private paginationOptions: IQueryOptions = {};
  private selectFields: Record<string, boolean> | null = null;
  private includeRelations: Record<string, any> | null = null;
  private searchableFields: string[] = [];

  constructor(
    model: {
      findMany: (args: any) => Promise<T[]>;
      count: (args: any) => Promise<number>;
    },
    query: Record<string, any>,
  ) {
    this.model = model;
    this.query = query;
  }

  // Set searchable fields for search functionality
  searchable(fields: string[]): this {
    this.searchableFields = fields;
    return this;
  }

  // Add search condition
  search(): this {
    const searchTerm = this.query.searchTerm;
    if (searchTerm && this.searchableFields.length > 0) {
      const orConditions = this.searchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive" as const,
        },
      }));

      this.whereConditions = {
        ...this.whereConditions,
        OR: orConditions,
      };
    }
    return this;
  }

  // Add filter conditions
  filter(): this {
    const { searchTerm, ...filterData } = this.query;

    if (Object.keys(filterData).length > 0) {
      const andConditions: any[] = [];

      Object.keys(filterData).forEach((key) => {
        const value = filterData[key];

        // Handle boolean conversion for string values
        if (value === "true" || value === "false") {
          andConditions.push({
            [key]: value === "true",
          });
        } else if (value !== undefined && value !== null && value !== "") {
          andConditions.push({
            [key]: {
              equals: value,
            },
          });
        }
      });

      if (andConditions.length > 0) {
        this.whereConditions = {
          ...this.whereConditions,
          AND: andConditions,
        };
      }
    }

    return this;
  }

  // Add custom where condition
  where(condition: any): this {
    this.whereConditions = {
      ...this.whereConditions,
      ...condition,
    };
    return this;
  }

  // Set select fields
  select(fields: Record<string, boolean>): this {
    this.selectFields = fields;
    return this;
  }

  // Set include relations
  include(relations: Record<string, any>): this {
    this.includeRelations = relations;
    return this;
  }

  // Set sorting
  sort(): this {
    const { sortBy, sortOrder } = this.query;
    this.paginationOptions.sortBy = sortBy;
    this.paginationOptions.sortOrder = sortOrder;

    if (sortBy && sortOrder) {
      this.orderBy = {
        [sortBy]: sortOrder,
      };
    } else {
      this.orderBy = {
        createdAt: "desc",
      };
    }

    return this;
  }

  // Set custom sorting
  setSort(sortBy: string, sortOrder: "asc" | "desc"): this {
    this.orderBy = {
      [sortBy]: sortOrder,
    };
    this.paginationOptions.sortBy = sortBy;
    this.paginationOptions.sortOrder = sortOrder;
    return this;
  }

  // Set pagination
  paginate(): this {
    const { page, limit } = this.query;
    this.paginationOptions.page = Number(page) || 1;
    this.paginationOptions.limit = Number(limit) || 10;
    return this;
  }

  // Set custom pagination
  setPagination(page: number, limit: number): this {
    this.paginationOptions.page = page;
    this.paginationOptions.limit = limit;
    return this;
  }

  // Build and execute the query
  async execute(): Promise<IQueryResult<T>> {
    const { page, limit, skip } = paginationHelper.calculatePagination(
      this.paginationOptions,
    );

    const findManyArgs: any = {
      where: this.whereConditions,
      skip,
      take: limit,
      orderBy: this.orderBy,
    };

    if (this.selectFields) {
      findManyArgs.select = this.selectFields;
    }

    if (this.includeRelations) {
      findManyArgs.include = this.includeRelations;
    }

    const [data, total] = await Promise.all([
      this.model.findMany(findManyArgs),
      this.model.count({ where: this.whereConditions }),
    ]);

    return {
      meta: {
        page,
        limit,
        total,
      },
      data,
    };
  }

  // Execute with custom transformation
  async executeWithTransform<R>(
    transformFn: (data: T[]) => Promise<R[]>,
  ): Promise<IQueryResult<R>> {
    const { page, limit, skip } = paginationHelper.calculatePagination(
      this.paginationOptions,
    );

    const findManyArgs: any = {
      where: this.whereConditions,
      skip,
      take: limit,
      orderBy: this.orderBy,
    };

    if (this.selectFields) {
      findManyArgs.select = this.selectFields;
    }

    if (this.includeRelations) {
      findManyArgs.include = this.includeRelations;
    }

    const [data, total] = await Promise.all([
      this.model.findMany(findManyArgs),
      this.model.count({ where: this.whereConditions }),
    ]);

    const transformedData = await transformFn(data);

    return {
      meta: {
        page,
        limit,
        total,
      },
      data: transformedData,
    };
  }
}

export default QueryBuilder;
