import { AppError } from '../../errors/Apperror';
import { asyncHandler } from '../../middlewares/asyncHandler';
import GithubAppService from './github_app.service';

export class GithuAppController {
  constructor(private githubService: GithubAppService) {}

  public installGithubApp = asyncHandler(async (req, res) => {
    const { installation_id, code } = req.query;
    const {"renderLite-access":token} = req.cookies
    const userId = req.userId
    if(!userId){
      throw new AppError("User id not found",404)
    }


    if (!installation_id || !code) {
      return res.status(400).json({
        message: 'Installation ID and code are required',
      });
    }

    const installation = await this.githubService.createInstallation(
      Number(installation_id),
      userId,
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

  public getInstallRepos = asyncHandler(async (req, res) => {
    const {"renderLite-access":jwt_token} = req.cookies
    console.log(jwt_token)
    // const  installation_id  = req.query.installation_id as string
    // console.log(installation_id)

    //   if(Array.isArray(installation_id)){
    //       console.log(installation_id[0])
    //   }else{
    //     console.log(installation_id)
    //   }
    // if (!installation_id) {
    //   return res.status(400).json({
    //     message: 'Installation ID is requirzed',
    //   });
    // }
    if(!jwt_token){
      res.status(401).json({
        message:"Unathorized access"
      }
      )
    }
    const repos = await this.githubService.getInstallationRepos(jwt_token);
    return res.status(200).json({
      messages: 'Repos fetched successfully ',
      repositories: repos,
    });
  });
  public getInstallationId = asyncHandler(async (req,res)=>{
    
  })
}
