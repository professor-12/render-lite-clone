import { asyncHandler } from '../../middlewares/asyncHandler';
import GithubAppService from './github_app.service';

export class GithuAppController {
  constructor(private githubService: GithubAppService) {}

  public installGithubApp = asyncHandler(async (req, res) => {
    const { installation_id, code } = req.query;

    if (!installation_id || !code) {
      return res.status(400).json({
        message: 'Installation ID and code are required',
      });
    }

    const installation = await this.githubService.createInstallation(
      Number(installation_id),
      code as string,
    );

    return res.send(`
      <script>
        window.opener.postMessage(
          {
            type: "github_install_success",
            installationId: "${installation.installationId}",
            account: "${installation.accountLogin}"
          },
          window.location.origin
        );
        window.close();
      </script>
    `);
  });
}
