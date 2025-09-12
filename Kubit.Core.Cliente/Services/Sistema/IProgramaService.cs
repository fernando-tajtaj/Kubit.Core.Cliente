using Kubit.Core.Modelo.Schemas.Sistema;

namespace Kubit.Core.Cliente.Services.Sistema
{
    public interface IProgramaService
    {
        Task<Programa?> GetProgramaUuidAsync(string pProgramaUuid, CancellationToken cancellationToken = default);
    }
}
