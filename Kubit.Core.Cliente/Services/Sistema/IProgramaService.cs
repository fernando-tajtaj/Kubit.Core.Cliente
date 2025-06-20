using Kubit.Core.Modelo;

namespace Kubit.Core.Cliente.Services.Sistema
{
    public interface IProgramaService
    {
        Task<Programa?> GetProgramaUuidAsync(string pProgramaUuid, CancellationToken cancellationToken = default);
    }
}
