# tokamak-optimism-deploy
Resources for running the tokamak network based on kubernetes

## Directory Strcture
```
kustomize
├─ bases: kubernetes bases resource like statefulset, deployment, service, etc
├─ envs: env files and kustomize file to make kubernetes configmap
├─ overlays: overlays set entire kubernetes resource and it can override other resources
└─ scripts: scripts and kustomize file to make kubernetes configmap
vendor: several helpful resources (local kubernetes cluster config file, etc)
```

## Prerequisites
- `kubectl` **Minimum version v1.20** [Install notes](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/#install-kubectl-on-linux)
- `kind` from a [kind page](https://kind.sigs.k8s.io/docs/user/quick-start) or
 `minikube` from a [minikube page](https://minikube.sigs.k8s.io/docs/start/)
- Docker

## Configuration
There are resources in `kustomize/envs`, `kustomize/overlays` for each environment. First environment is `test-phase1`.

### test-phase1
Test-phase1 is for local network test. It consists of one `l1`, one `l2`, one `data-transport-layer`, one `deployer`, one `batch-submitter` and one `relayer`.

You can set the configuration by editing `*.env` files in `kustomize/envs/test-phase1`.

You must create `secret.env` in by referencing `secret.env.example`.

## Run
This is an example of `test-phase1`.
### create a cluster
first,
```
cd ops-tokamak
```

kind
```
kind create cluster --config=./vendor/kind/config.yaml
```
or
minikube
```
minikube start --cpus 4 --memory 16384
# customize the cps and the memory for your system
```
### deploy test-phase1 resource
```
kubectl apply -k ./kustomize/overlays/test-phase1/
```
### monitoring
```
kubectl get pods
```
If you can see all `Running` in the status, then everyting was successful!

This may take some time.(about 5m)
### endpoint
kind

Kind provide port forwarding. this network is up,
```
l1 endpoint: http://localhost:9545
l2 endpoint: http://localhost:8545, ws://localhost:8546
dtl endpoint: http://localhost:7878
```
This is possible because of the `Nodeport` and port forwarding of the kind docker container.

minikube

Minikube doesn't provide port forwarding. this network is up,
```
l1 endpoint: http://{minikube address}:30545
l2 endpoint: http://{minikube address}:31545, ws://{minikube address}:31546
dtl endpoint: http://{minikube address}:30878
```
You can get `minikube address` to follow below command.
```
minikube ip
```
Notice that minkube is accessible from only local system.

## Delete cluster
kind
```
kind delete cluster
```
minikube
```
minikube delete
```
