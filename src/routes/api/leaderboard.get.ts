import { Route } from '@sapphire/plugin-api';
import { getUsersPaginated } from '../../utils/database';
import { isLemonLineMember } from '../../lib/isLemonLineMember';

export class LeaderboardRoute extends Route {
  public async run(request: Route.Request, response: Route.Response) {
    const auth = request.auth;
    if (auth && await isLemonLineMember(request, this.container)) {
        const params = request.query;

        const perPage = Math.min(
            Math.max(Number(params['perPage']) || 25, 1),
            100
          );
        const page = Math.max(Number(params['page']) || 1, 1);
        const sortBy = params['sortBy'] === 'messageCount' ? 'messageCount' : 'xp';
        const ascending = params['ascending'] === 'true';

        const result = await getUsersPaginated(
            perPage,
            page,
            sortBy,
            ascending
          );

        const newDataMapResult = result.data.map(async (user) => {
            const discordUser = await this.container.client.users.cache.get(user.discordId);
            const avatar = discordUser?.avatarURL() || null;
            const username = discordUser?.username;
            return {
                ...user,
                avatar,
                username
            };
        });

        const newData = await Promise.all(newDataMapResult);

        const resultWithUserAvatars = {
            data: newData,
            meta: result.meta
        }
  
        return response.ok(resultWithUserAvatars);
    }
    else return response.unauthorized();
  }
}