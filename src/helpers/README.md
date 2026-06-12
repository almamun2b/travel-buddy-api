# QueryBuilder

A reusable, chainable query builder for Prisma that handles search, filter, sort, and pagination operations.

## Features

- **Search**: Search across multiple fields with case-insensitive matching
- **Filter**: Apply multiple filter conditions with automatic boolean conversion
- **Sort**: Customizable sorting with support for multiple fields
- **Pagination**: Built-in pagination with page, limit, and total count
- **Select**: Choose specific fields to return
- **Include**: Include related data with nested selects
- **Transform**: Execute with custom data transformation functions
- **Chainable**: Fluent API for building complex queries

## Installation

The QueryBuilder is already included in the helpers directory. Import it in your service files:

```typescript
import QueryBuilder from "../helpers/queryBuilder";
import prisma from "../shared/prisma";
```

## Basic Usage

```typescript
const getAllUsers = async (query: any) => {
  const queryBuilder = new QueryBuilder(prisma.user, query)
    .searchable(["fullName", "email", "currentLocation"])
    .search()
    .filter()
    .sort()
    .paginate();

  const result = await queryBuilder.execute();
  return result;
};
```

## API Reference

### Constructor

```typescript
new QueryBuilder(model: PrismaModel, query: Record<string, any>)
```

- `model`: Prisma model (e.g., `prisma.user`, `prisma.travelPlan`)
- `query`: Query parameters from request (e.g., `req.query`)

### Methods

#### `searchable(fields: string[])`

Set the fields that can be searched using the `searchTerm` parameter.

```typescript
.searchable(["fullName", "email", "bio"])
```

#### `search()`

Apply search condition based on `searchTerm` query parameter.

```typescript
.search()
```

#### `filter()`

Apply filter conditions from query parameters. Automatically handles boolean conversion.

```typescript
.filter()
```

#### `where(condition: Prisma.WhereInput)`

Add custom where conditions.

```typescript
.where({ isDeleted: false, status: "ACTIVE" })
```

#### `select(fields: Record<string, boolean>)`

Select specific fields to return.

```typescript
.select({
  id: true,
  fullName: true,
  email: true,
  avatar: true,
})
```

#### `include(relations: Record<string, any>)`

Include related data with nested selects.

```typescript
.include({
  subscription: {
    select: {
      plan: true,
      status: true,
    },
  },
  _count: {
    select: {
      travelPlans: true,
    },
  },
})
```

#### `sort()`

Apply sorting based on `sortBy` and `sortOrder` query parameters. Defaults to `createdAt: desc`.

```typescript
.sort()
```

#### `setSort(sortBy: string, sortOrder: "asc" | "desc")`

Set custom sorting programmatically.

```typescript
.setSort("fullName", "asc")
```

#### `paginate()`

Apply pagination based on `page` and `limit` query parameters. Defaults to page 1, limit 10.

```typescript
.paginate()
```

#### `setPagination(page: number, limit: number)`

Set custom pagination programmatically.

```typescript
.setPagination(1, 20)
```

#### `execute()`

Execute the query and return data with meta information.

```typescript
const result = await queryBuilder.execute();
// Returns: { meta: { page, limit, total }, data: T[] }
```

#### `executeWithTransform<R>(transformFn: (data: T[]) => Promise<R[]>)`

Execute the query with a custom transformation function.

```typescript
const result = await queryBuilder.executeWithTransform(async (users) => {
  return users.map(user => ({
    ...user,
    fullName: user.fullName.toUpperCase(),
  }));
});
```

## Query Parameters

The QueryBuilder expects the following query parameters:

- `searchTerm`: Search term for searching across searchable fields
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sortBy`: Field to sort by (default: createdAt)
- `sortOrder`: Sort direction "asc" or "desc" (default: desc)
- Any other field names will be treated as filter conditions

## Examples

### Example 1: Basic Usage

```typescript
const getAllUsers = async (query: any) => {
  const queryBuilder = new QueryBuilder(prisma.user, query)
    .searchable(["fullName", "email"])
    .search()
    .filter()
    .sort()
    .paginate();

  return await queryBuilder.execute();
};
```

### Example 2: With Custom Where Condition

```typescript
const getActiveUsers = async (query: any) => {
  const queryBuilder = new QueryBuilder(prisma.user, query)
    .searchable(["fullName", "email"])
    .search()
    .filter()
    .where({ isDeleted: false, status: "ACTIVE" })
    .sort()
    .paginate();

  return await queryBuilder.execute();
};
```

### Example 3: With Select and Include

```typescript
const getUsersWithDetails = async (query: any) => {
  const queryBuilder = new QueryBuilder(prisma.user, query)
    .searchable(["fullName", "email"])
    .search()
    .filter()
    .select({
      id: true,
      fullName: true,
      email: true,
      avatar: true,
    })
    .include({
      subscription: {
        select: {
          plan: true,
          status: true,
        },
      },
    })
    .sort()
    .paginate();

  return await queryBuilder.execute();
};
```

### Example 4: With Data Transformation

```typescript
const getUsersWithRating = async (query: any) => {
  const queryBuilder = new QueryBuilder(prisma.user, query)
    .searchable(["fullName", "email"])
    .search()
    .filter()
    .where({ isDeleted: false })
    .sort()
    .paginate();

  const result = await queryBuilder.executeWithTransform(async (users) => {
    const usersWithRating = await Promise.all(
      users.map(async (user: any) => {
        const avgRating = await prisma.review.aggregate({
          where: { revieweeId: user.id },
          _avg: { rating: true },
        });

        return {
          ...user,
          avgRating: avgRating._avg.rating || 0,
        };
      })
    );

    return usersWithRating;
  });

  return result;
};
```

### Example 5: Custom Sorting and Pagination

```typescript
const getUsersCustom = async (query: any) => {
  const queryBuilder = new QueryBuilder(prisma.user, query)
    .searchable(["fullName", "email"])
    .search()
    .filter()
    .setSort("fullName", "asc")
    .setPagination(1, 20);

  return await queryBuilder.execute();
};
```

## Return Format

The QueryBuilder returns an object with the following structure:

```typescript
{
  meta: {
    page: number,
    limit: number,
    total: number
  },
  data: T[]
}
```

This format is compatible with the `sendResponse` helper function used in controllers.

## Integration with Controllers

```typescript
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const queryBuilder = new QueryBuilder(prisma.user, req.query)
    .searchable(userSearchAbleFields)
    .search()
    .filter()
    .sort()
    .paginate();

  const result = await queryBuilder.execute();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});
```

## Notes

- The QueryBuilder automatically handles boolean conversion for filter values (e.g., "true" → true)
- Search is case-insensitive by default
- Default sorting is by `createdAt` in descending order
- Default pagination is page 1 with 10 items per page
- The QueryBuilder is fully type-safe when used with TypeScript
