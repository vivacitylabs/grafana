properties([
    parameters([
        booleanParam(name: 'pushImage', defaultValue: false, description: 'push image to GCP'),
    ]),
])

def checkout() {
    scmVars = checkout([
        $class: 'GitSCM',
        branches: scm.branches,
        extensions: [
            [$class: 'WipeWorkspace'],
            [
                $class: 'SubmoduleOption',
                disableSubmodules: false,
                parentCredentials: true,
                recursiveSubmodules: true,
                reference: '',
                trackingSubmodules: false
            ]
        ],
        submoduleCfg: [],
        userRemoteConfigs: scm.userRemoteConfigs
    ])

    return scmVars.GIT_COMMIT.take(7)
}

def build(gitCommit) {
  def imageBucket = "eu.gcr.io/atrocity-management/amd64/grafana"
  def images = []
  def imageName = ""
    withGCP("atrocity-gcr-puller") {
        sshagent(['github-key']) {

          def imageTag = gitCommit + "-grafana"
          imageName = "${imageName}:${imageTag}"
          buildDockerImage("grafana", imageName, null, null)
      }
    }
    return imageName
}

def pushImage(imageName) {
    withGCP("atrocity-gcr-pusher") {
        sh "docker push ${imageName}"
    }
}

def cleanUp(imageName) {
  sh "docker rmi -f ${imageName} || true"
}

try {
  def gitCommit = ""
  def imageName = ""
  node("dashboard") {
      echo "STAGED 0"

      stage("SCM checkout") {
          gitCommit = checkout()
      }

      echo "STAGED 1"

      stage("Build docker image") {
        imageName = build(gitCommit)
      }
      echo "STAGED 2"
      if (params.pushImage || env.BRANCH_NAME == "master") {
        stage("Push docker image") {
          pushImage(imageName)
        }
      }
      echo "STAGED 3"

      stage("Clean up") {
        cleanUp(imageName)
        deleteDir()
      }

      echo "STAGED 4"
  }
} catch(Exception e) {
    throw e
}
