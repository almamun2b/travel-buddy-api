import QueryBuilder from "./queryBuilder";
import prisma from "../shared/prisma";
import { userSearchAbleFields } from "../app/modules/user/user.constant";

// Example 1: Basic usage with search, filter, sort, and pagination
const getAllUsersExample = async (query: any) => {
  const queryBuilder = new QueryBuilder(prisma.user, query)
    .searchable(userSearchAbleFields)
    .search()
    .filter()
    .sort()
    .paginate();

  const result = await queryBuilder.execute();
  return result;
};

// Example 2: With custom where condition
const getActiveUsersExample = async (query: any) => {
  const queryBuilder = new QueryBuilder(prisma.user, query)
    .searchable(userSearchAbleFields)
    .search()
    .filter()
    .where({ isDeleted: false, status: "ACTIVE" })
    .sort()
    .paginate();

  const result = await queryBuilder.execute();
  return result;
};

// Example 3: With select fields
const getUsersWithSelectExample = async (query: any) => {
  const queryBuilder = new QueryBuilder(prisma.user, query)
    .searchable(userSearchAbleFields)
    .search()
    .filter()
    .select({
      id: true,
      fullName: true,
      email: true,
      avatar: true,
      createdAt: true,
    })
    .sort()
    .paginate();

  const result = await queryBuilder.execute();
  return result;
};

// Example 4: With include relations
const getUsersWithRelationsExample = async (query: any) => {
  const queryBuilder = new QueryBuilder(prisma.user, query)
    .searchable(userSearchAbleFields)
    .search()
    .filter()
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
          reviewsReceived: true,
        },
      },
    })
    .sort()
    .paginate();

  const result = await queryBuilder.execute();
  return result;
};

// Example 5: With custom sorting and pagination
const getUsersCustomExample = async (query: any) => {
  const queryBuilder = new QueryBuilder(prisma.user, query)
    .searchable(userSearchAbleFields)
    .search()
    .filter()
    .setSort("fullName", "asc")
    .setPagination(1, 20);

  const result = await queryBuilder.execute();
  return result;
};

// Example 6: With data transformation
const getUsersWithRatingExample = async (query: any) => {
  const queryBuilder = new QueryBuilder(prisma.user, query)
    .searchable(userSearchAbleFields)
    .search()
    .filter()
    .where({ isDeleted: false, isVerified: true })
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

// Example 7: Travel plans with complex filtering
const getTravelPlansExample = async (query: any) => {
  const queryBuilder = new QueryBuilder(prisma.travelPlan, query)
    .searchable(["title", "destination", "description"])
    .search()
    .filter()
    .where({ isDeleted: false })
    .include({
      creator: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
    })
    .sort()
    .paginate();

  const result = await queryBuilder.execute();
  return result;
};

export {
  getAllUsersExample,
  getActiveUsersExample,
  getUsersWithSelectExample,
  getUsersWithRelationsExample,
  getUsersCustomExample,
  getUsersWithRatingExample,
  getTravelPlansExample,
};
