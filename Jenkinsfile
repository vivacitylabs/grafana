properties([
    parameters([
        booleanParam(name: 'pushImage', defaultValue: false, description: 'push image to GCP'),
    ]),
])

def getNodeIP() {
    return sh(returnStdout: true,
                script: 'ip -4 a show dev eth0  | grep inet | cut -d " " -f6 | cut -d "/" -f1').trim()
}

def pushImages(project, uuid, arch, gitCommit) {
    def images = []
    def projectName = project == "master" ? "" : "${project}-"
    def branchName = env.BRANCH_NAME == "master" ? "" : "${env.BRANCH_NAME}-"
    def tags = []
    def commitString = "${branchName}${projectName}${gitCommit}"
    def commitMessage = sh(returnStdout: true, script: "git log --format=format:%s -1 ${gitCommit}")

    tags = [commitString]


    tags.each { tag ->
        images += retagAndPushImage("grafana:${uuid}-amd64-${project}", "eu.gcr.io/atrocity-management/grafana/supermario:${tag}")
    }

    return images
}

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

stage("Assigning main CI node") {
    node("dashboard") {
        mainNode.name = env.NODE_NAME
        mainNode.ip = getNodeIP()
    }

    println "Running CI on: ${mainNode.name} (${mainNode.ip})"
}

try {
  def gitCommit = ""
  def imageName = ""
  node(mainNode.name) {
      stage("SCM checkout") {
          gitCommit = checkout()
      }

      stage("Build docker image") {
        imageName = build(gitCommit)
      }

      if (params.pushImage || env.BRANCH_NAME == "master") {
        stage("Push docker image") {
          pushImage(imageName)
        }
      }

      stage("Clean up") {
        cleanUp(imageName)
        deleteDir()
      }
  }
} catch(Exception e) {
    throw e
}
